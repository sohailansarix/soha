import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await db.blogBookmark.findUnique({
    where: { postId_userId: { postId: post.id, userId: session.user.id } },
  });

  let bookmarked: boolean;
  if (existing) {
    await db.blogBookmark.delete({ where: { id: existing.id } });
    bookmarked = false;
  } else {
    await db.blogBookmark.create({ data: { postId: post.id, userId: session.user.id } });
    bookmarked = true;
  }

  return NextResponse.json({ ok: true, bookmarked });
}
