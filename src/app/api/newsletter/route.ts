import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`newsletter:${ip}`, 10, 60_000)) return rateLimitResponse();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email } = parsed.data;
  await db.newsletterSubscriber
    .upsert({
      where: { email },
      update: { subscribed: true },
      create: { email, subscribed: true },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
