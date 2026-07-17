import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  content: z.string().min(1),
  parentId: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const session = await auth();
  await db.blogComment.create({
    data: {
      postId: post.id,
      userId: session?.user?.id ?? null,
      authorName: parsed.data.name,
      authorEmail: parsed.data.email,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
      // Auto-approve for authenticated users, moderate guests.
      isApproved: Boolean(session?.user),
    },
  });

  return NextResponse.json({ ok: true });
}
