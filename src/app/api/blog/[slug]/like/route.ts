import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Anonymous like token stored in localStorage by the client.
function clientToken(req: Request): string | null {
  const header = req.headers.get("x-blog-token");
  return header && header.length > 0 ? header : null;
}

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await auth();
  const token = clientToken(_req);
  const userId = session?.user?.id;

  const existing = userId
    ? await db.blogLike.findUnique({ where: { postId_userId: { postId: post.id, userId } } })
    : token
      ? await db.blogLike.findUnique({ where: { postId_token: { postId: post.id, token } } })
      : null;

  let liked: boolean;
  if (existing) {
    await db.blogLike.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await db.blogLike.create({
      data: { postId: post.id, userId: userId ?? null, token: userId ? null : token },
    });
    liked = true;
  }

  const likeCount = await db.blogLike.count({ where: { postId: post.id } });
  await db.blogPost.update({ where: { id: post.id }, data: { likeCount } }).catch(() => null);

  return NextResponse.json({ ok: true, liked, likes: likeCount });
}
