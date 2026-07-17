import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: true },
  });

  if (!order || order.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  const currency = await getActiveCurrency();
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.sku}</td><td>${i.quantity}</td><td>${formatMoney(
          Number(i.price),
          currency,
        )}</td><td>${formatMoney(Number(i.price) * i.quantity, currency)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.orderNumber}</title>
  <style>body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a1a}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e5e5e5}.right{text-align:right}.muted{color:#737373}</style></head>
  <body>
  <h1>SOHA</h1>
  <h2>Invoice ${order.orderNumber}</h2>
  <p class="muted">Issued ${formatDate(order.createdAt)}</p>
  <p><strong>Bill to:</strong> ${order.address?.fullName ?? order.user.email}<br/>
  ${order.address?.line1 ?? ""} ${order.address?.city ?? ""} ${order.address?.postalCode ?? ""} ${order.address?.country ?? ""}</p>
  <table><thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Unit</th><th class="right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="right" style="margin-top:20px">
    <p>Subtotal: ${formatMoney(order.subtotal, currency)}</p>
    <p>Discount: ${formatMoney(order.discount, currency)}</p>
    <p>Shipping: ${formatMoney(order.shipping, currency)}</p>
    <p>Tax: ${formatMoney(order.tax, currency)}</p>
    <h3>Total: ${formatMoney(order.total, currency)}</h3>
  </div>
  </body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.html"`,
    },
  });
}
