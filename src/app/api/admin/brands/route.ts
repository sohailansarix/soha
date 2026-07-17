import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = { ...parsed.data, logo: parsed.data.logo || undefined, description: parsed.data.description || undefined };
  const brand = await db.brand.create({ data });
  return NextResponse.json({ ok: true, brand });
}

export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const brands = await db.brand.findMany({ orderBy: [{ name: "asc" }] });
  return NextResponse.json({ brands });
}
