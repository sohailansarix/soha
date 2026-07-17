import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in to review" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      isApproved: false,
    },
  });

  return NextResponse.json({ id: review.id }, { status: 201 });
}
