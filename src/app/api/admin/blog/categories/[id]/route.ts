import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const category = await db.blogCategory.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, category });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.blogCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
