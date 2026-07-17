import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({ status: z.enum([
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED",
]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: { status: typeof parsed.data.status; paymentStatus?: "PAID" | "REFUNDED" } = {
    status: parsed.data.status,
  };
  // When an order is marked delivered, mark its payment as completed/paid.
  if (parsed.data.status === "DELIVERED") data.paymentStatus = "PAID";
  // When an order is refunded, mark its payment as refunded.
  if (parsed.data.status === "REFUNDED") data.paymentStatus = "REFUNDED";

  const order = await db.order.update({ where: { id }, data });
  return NextResponse.json({ ok: true, order });
}
