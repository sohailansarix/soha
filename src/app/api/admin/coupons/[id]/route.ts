import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({
  code: z.string().min(1),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  minOrder: z.number().min(0).optional(),
  maxUses: z.number().int().min(0).optional().nullable(),
  perUserLimit: z.number().int().min(0).optional().nullable(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrder: parsed.data.minOrder,
      maxUses: parsed.data.maxUses ?? null,
      perUserLimit: parsed.data.perUserLimit ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive ?? true,
    },
  });
  return NextResponse.json({ ok: true, coupon });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
