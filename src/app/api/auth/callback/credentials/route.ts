import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password, callbackUrl } = body as {
    email?: string;
    password?: string;
    callbackUrl?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result || result.error) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, url: callbackUrl ?? "/" });
}
