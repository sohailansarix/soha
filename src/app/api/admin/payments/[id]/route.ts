import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({ amount: z.number().min(0).optional(), reason: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const payment = await db.payment.findUnique({ where: { id }, include: { order: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const refundAmount = parsed.data.amount ?? Number(payment.amount);
  if (refundAmount > Number(payment.amount)) {
    return NextResponse.json({ error: "Refund exceeds payment amount" }, { status: 400 });
  }

  const [refund, updatedPayment, updatedOrder] = await db.$transaction([
    db.refund.create({
      data: {
        orderId: payment.orderId,
        amount: refundAmount,
        reason: parsed.data.reason ?? "Admin refund",
        status: "REFUNDED",
      },
    }),
    db.payment.update({
      where: { id },
      data: { status: refundAmount >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    }),
    db.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: refundAmount >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    }),
  ]);

  await db.auditLog
    .create({
      data: {
        userId: session!.user.id,
        action: "PAYMENT_REFUND",
        entity: "Payment",
        entityId: id,
        metadata: { amount: refundAmount, reason: parsed.data.reason },
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true, refund, payment: updatedPayment, order: updatedOrder });
}
