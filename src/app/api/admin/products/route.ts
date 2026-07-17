import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isReturnable: z.boolean().optional(),
  returnWindow: z.coerce.number().int().min(0).optional(),
  // Empty string / null must become null (not 0). z.coerce.number() would turn
  // null/"" into 0, which the product page then renders as "free on this item".
  shippingFee: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  freeShippingOver: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  // Dynamic option definitions, e.g. [{ name: "Color", values: ["Red","Blue"] }]
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string().min(1)).min(1),
      }),
    )
    .optional(),
  // Each variant carries its own price + compareAtPrice and a JSON attributes map.
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(1),
        attributes: z.record(z.string(), z.string()).optional(),
        stock: z.coerce.number().int().min(0),
        price: z.coerce.number().min(0),
        compareAtPrice: z.coerce.number().min(0).optional(),
      }),
    )
    .min(1, "At least one variant is required"),
  attributes: z
    .array(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .optional(),
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().optional(), position: z.number().int().optional() }))
    .optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { attributes, options, variants, ...rest } = parsed.data;
  // Normalize empty brandId to undefined (avoids FK constraint violation).
  rest.brandId = rest.brandId || undefined;
  // If free shipping is set to 0 (free on this item), the delivery charge
  // must also be 0 — there is no charge to waive.
  if (rest.freeShippingOver === 0) rest.shippingFee = 0;
  // Denormalized helper for listing filters/sort.
  const minPrice = Math.min(...variants.map((v) => Number(v.price)));
  const product = await db.product.create({
    data: {
      ...rest,
      minPrice,
      images: rest.images?.length
        ? { create: rest.images.map((img, i) => ({ url: img.url, alt: img.alt, position: img.position ?? i })) }
        : undefined,
      attributes: attributes?.length
        ? { create: attributes.map((a) => ({ key: a.key, value: a.value })) }
        : undefined,
      options: options?.length
        ? {
            create: options.map((o, oi) => ({
              name: o.name,
              position: oi,
              values: {
                create: o.values.map((val, vi) => ({ value: val, position: vi })),
              },
            })),
          }
        : undefined,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          attributes: v.attributes ?? {},
          stock: v.stock,
          price: v.price,
          compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice : undefined,
        })),
      },
    },
  });
  await db.auditLog
    .create({
      data: {
        userId: session!.user.id,
        action: "PRODUCT_CREATE",
        entity: "Product",
        entityId: product.id,
      },
    })
    .catch(() => null);
  return NextResponse.json({ ok: true, product });
}

export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const products = await db.product.findMany({ orderBy: [{ createdAt: "desc" }] });
  return NextResponse.json({ products });
}
