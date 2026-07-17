import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Always return success to avoid user enumeration.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: `reset:${email}`, token } },
      update: { expires },
      create: { identifier: `reset:${email}`, token, expires },
    });
    // TODO: send email via Resend with reset link.
    // await sendResetEmail(email, `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`);
  }

  return NextResponse.json({ ok: true });
}
