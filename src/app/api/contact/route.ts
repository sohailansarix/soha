import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const session = await auth();
  await db.contactMessage.create({
    data: { ...parsed.data, userId: session?.user?.id },
  });

  return NextResponse.json({ ok: true });
}
