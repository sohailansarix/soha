import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 });
  }

  await db.order.update({
    where: { id },
    data: {
      status: "CANCELLED",
      paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
    },
  });

  // Restore variant stock
  const full = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (full) {
    for (const item of full.items) {
      if (item.variantId) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  await db.notification.create({
    data: {
      userId: session.user.id,
      type: "ORDER",
      title: "Order cancelled",
      message: `Your order ${order.orderNumber} has been cancelled.`,
      link: `/dashboard/orders/${id}`,
    },
  });

  return NextResponse.json({ ok: true });
}
