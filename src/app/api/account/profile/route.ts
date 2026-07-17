import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (newPassword) {
    if (!currentPassword || !user.password) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const existing = await db.user.findFirst({ where: { email, NOT: { id: user.id } } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
