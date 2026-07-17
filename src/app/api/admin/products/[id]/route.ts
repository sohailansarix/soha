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
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string().min(1)).min(1),
      }),
    )
    .optional(),
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const { attributes, images, options, variants, ...rest } = parsed.data;
    // Normalize empty brandId to undefined (avoids FK constraint violation).
    rest.brandId = rest.brandId || undefined;
    // If free shipping is set to 0 (free on this item), the delivery charge
    // must also be 0 — there is no charge to waive.
    if (rest.freeShippingOver === 0) rest.shippingFee = 0;
    // Denormalized helper for listing filters/sort.
    const minPrice = variants.length ? Math.min(...variants.map((v) => Number(v.price))) : 0;

    // Replace images when provided.
    if (images) {
      await db.productImage.deleteMany({ where: { productId: id } });
    }
    // Replace attributes when provided.
    if (attributes) {
      await db.productAttribute.deleteMany({ where: { productId: id } });
    }
    // Replace options when provided (options have no external references).
    if (options) {
      await db.productOption.deleteMany({ where: { productId: id } });
    }

    // Variants: upsert by id (preserve existing, create new, delete removed)
    // instead of blindly deleting + recreating everything.
    const existingVariantIds = variants.filter((v) => v.id).map((v) => v.id as string);
    if (variants.length) {
      await db.productVariant.deleteMany({
        where: { productId: id, NOT: { id: { in: existingVariantIds } } },
      });
    }
    const newVariants = variants.filter((v) => !v.id);
    const updVariants = variants.filter((v) => v.id);
    const variantWrite: {
      create?: Array<{
        sku: string;
        attributes: Record<string, string>;
        stock: number;
        price: number;
        compareAtPrice?: number;
      }>;
      update?: Array<{
        where: { id: string };
        data: {
          sku: string;
          attributes: Record<string, string>;
          stock: number;
          price: number;
          compareAtPrice?: number;
        };
      }>;
    } = {};
    if (newVariants.length) {
      variantWrite.create = newVariants.map((v) => ({
        sku: v.sku,
        attributes: v.attributes ?? {},
        stock: v.stock,
        price: v.price,
        compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice : undefined,
      }));
    }
    if (updVariants.length) {
      variantWrite.update = updVariants.map((v) => ({
        where: { id: v.id as string },
        data: {
          sku: v.sku,
          attributes: v.attributes ?? {},
          stock: v.stock,
          price: v.price,
          compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice : undefined,
        },
      }));
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...rest,
        minPrice,
        images: images?.length
          ? { create: images.map((img, i) => ({ url: img.url, alt: img.alt, position: img.position ?? i })) }
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
        variants: variantWrite,
      },
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("Product update failed:", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
