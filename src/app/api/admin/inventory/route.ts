import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({
  variantId: z.string().min(1),
  change: z.number().int(),
  reason: z.string().min(1).default("Manual adjustment"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { variantId, change, reason } = parsed.data;
  const variant = await db.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const newStock = Math.max(0, variant.stock + change);
  const actualChange = newStock - variant.stock;

  const updated = await db.$transaction([
    db.productVariant.update({ where: { id: variantId }, data: { stock: newStock } }),
    db.inventoryLog.create({
      data: { variantId, change: actualChange, reason },
    }),
  ]);

  await db.auditLog
    .create({
      data: {
        userId: session!.user.id,
        action: "INVENTORY_ADJUST",
        entity: "ProductVariant",
        entityId: variantId,
        metadata: { change: actualChange, reason, newStock },
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true, stock: updated[0].stock });
}
