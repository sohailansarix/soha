import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const schema = z.object({ name: z.string().min(1), slug: z.string().optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const tag = await db.blogTag.create({ data: { name: parsed.data.name, slug } });
  return NextResponse.json({ ok: true, tag });
}

export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tags = await db.blogTag.findMany({ orderBy: [{ name: "asc" }] });
  return NextResponse.json({ tags });
}
