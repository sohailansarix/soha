import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, password: hashed, role: "CUSTOMER" },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
