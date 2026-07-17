import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";
import PdfDocument from "pdfkit";
import { PassThrough } from "node:stream";

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

  // Build the PDF, buffering chunks into a single response body.
  const doc = new PdfDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];
  const pass = new PassThrough();
  pass.on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
  const nodeStream = doc.pipe(pass as unknown as NodeJS.WritableStream);

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("SOHA", { align: "left" });
  doc.fontSize(14).font("Helvetica").text(`Invoice ${order.orderNumber}`);
  doc
    .fontSize(10)
    .fillColor("#737373")
    .text(`Issued ${formatDate(order.createdAt)}`);
  doc.moveDown();

  // Bill to
  doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica-Bold").text("Bill to:");
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      [
        order.address?.fullName ?? order.user.email,
        [order.address?.line1, order.address?.line2]
          .filter(Boolean)
          .join(", "),
        [order.address?.city, order.address?.postalCode, order.address?.country]
          .filter(Boolean)
          .join(", "),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  doc.moveDown();

  // Items table
  const tableTop = doc.y + 10;
  const colX = { name: 50, sku: 250, qty: 330, unit: 380, amount: 470 };
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Item", colX.name, tableTop);
  doc.text("SKU", colX.sku, tableTop);
  doc.text("Qty", colX.qty, tableTop);
  doc.text("Unit", colX.unit, tableTop);
  doc.text("Amount", colX.amount, tableTop, { align: "right" });
  doc.moveDown();
  let y = doc.y;
  doc.font("Helvetica").fontSize(10);
  for (const i of order.items) {
    doc.text(i.name, colX.name, y, { width: 190 });
    doc.text(i.sku || "-", colX.sku, y);
    doc.text(String(i.quantity), colX.qty, y);
    doc.text(formatMoney(Number(i.price), currency), colX.unit, y);
    doc.text(formatMoney(Number(i.price) * i.quantity, currency), colX.amount, y, {
      align: "right",
    });
    y = doc.y + 6;
    doc
      .moveTo(50, y - 4)
      .lineTo(545, y - 4)
      .strokeColor("#e5e5e5")
      .lineWidth(0.5)
      .stroke();
  }

  // Totals
  doc.moveDown(2);
  const rightX = 545;
  const line = (label: string, value: number) => {
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(label, 350, doc.y, { continued: true, align: "left" })
      .text(formatMoney(value, currency), rightX, doc.y, { align: "right" });
    doc.moveDown(0.5);
  };
  line("Subtotal:", Number(order.subtotal));
  line("Discount:", Number(order.discount));
  line("Shipping:", Number(order.shipping));
  line("Tax:", Number(order.tax));
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Total:", 350, doc.y, { continued: true })
    .text(formatMoney(Number(order.total), currency), rightX, doc.y, { align: "right" });

  doc.end();

  await new Promise<void>((resolve) => {
    nodeStream.on("finish", () => resolve());
  });
  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
