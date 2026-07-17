import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  ids: z.array(z.string()).max(100),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const products = await db.product.findMany({
    where: { id: { in: parsed.data.ids }, isActive: true },
    select: { id: true, shippingFee: true, freeShippingOver: true },
  });
  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      shippingFee: p.shippingFee != null ? Number(p.shippingFee) : null,
      freeShippingOver: p.freeShippingOver != null ? Number(p.freeShippingOver) : null,
    })),
  });
}
