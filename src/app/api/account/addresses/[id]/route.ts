import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum(["SHIPPING", "BILLING"]),
  isDefault: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = await db.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;

  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, NOT: { id } },
      data: { isDefault: false },
    });
  }
  const updated = await db.address.update({ where: { id }, data });
  return NextResponse.json({ ok: true, address: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = await db.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
