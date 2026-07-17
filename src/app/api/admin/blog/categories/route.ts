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

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const category = await db.blogCategory.create({ data: { ...parsed.data, slug } });
  return NextResponse.json({ ok: true, category });
}

export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const categories = await db.blogCategory.findMany({ orderBy: [{ name: "asc" }] });
  return NextResponse.json({ categories });
}
