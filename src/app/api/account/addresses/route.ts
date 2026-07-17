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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;

  if (data.isDefault) {
    await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }
  const count = await db.address.count({ where: { userId: session.user.id } });
  const address = await db.address.create({
    data: { ...data, userId: session.user.id, isDefault: data.isDefault ?? count === 0 },
  });
  return NextResponse.json({ ok: true, address });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addresses = await db.address.findMany({ where: { userId: session.user.id } });
  return NextResponse.json({ addresses });
}
