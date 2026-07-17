import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CURRENCIES } from "@/lib/currency";

const schema = z.object({
  currency: z.string().refine((c) => c in CURRENCIES, "Unsupported currency"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid currency" }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { currency: parsed.data.currency },
  });
  return NextResponse.json({ ok: true, currency: user.currency });
}
