import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getDeliveryMethods } from "@/lib/constants";
import { getStoreSettings } from "@/lib/store-settings";
import { generateOrderNumber } from "@/lib/utils";

const itemSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  address: z.object({
    fullName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS", "SAME_DAY"]),
  paymentMethod: z.enum(["STRIPE", "RAZORPAY", "COD"]),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { items, address, deliveryMethod, paymentMethod, couponCode } = parsed.data;

  // Validate stock & build order items
  const productIds = items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  let productShipping = 0;
  let hasProductShipping = false;
  const orderItems: {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
    }
    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;
    const stock = variant ? variant.stock : 99;
    if (stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }
    const unitPrice = variant?.price
      ? Number(variant.price)
      : product.minPrice
        ? Number(product.minPrice)
        : 0;
    subtotal += unitPrice * item.quantity;

    // Product-specific delivery charge. If the order subtotal reaches the
    // product's free-shipping threshold, that product ships free.
    if (product.shippingFee != null) {
      hasProductShipping = true;
      const lineSubtotal = unitPrice * item.quantity;
      const freeOver = product.freeShippingOver != null ? Number(product.freeShippingOver) : null;
      if (freeOver == null || lineSubtotal < freeOver) {
        productShipping += Number(product.shippingFee) * item.quantity;
      }
    }

    orderItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      sku: variant?.sku ?? product.sku,
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  // Coupon
  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive) {
      const now = new Date();
      const userUses = await db.order.count({
        where: { userId: session.user.id, couponCode: coupon.code },
      });
      const valid =
        (!coupon.startsAt || coupon.startsAt <= now) &&
        (!coupon.expiresAt || coupon.expiresAt >= now) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
        (coupon.perUserLimit === null || userUses < coupon.perUserLimit) &&
        subtotal >= Number(coupon.minOrder);
      if (valid) {
        discount =
          coupon.type === "percentage"
            ? subtotal * (Number(coupon.value) / 100)
            : Number(coupon.value);
        appliedCoupon = coupon.code;
      }
    }
  }

  const settings = await getStoreSettings();
  const delivery = getDeliveryMethods(settings).find((d) => d.id === deliveryMethod)!;
  // Use product-specific delivery charges when any product defines one;
  // otherwise apply the flat fee for the chosen delivery method. There is
  // no site-wide free-shipping threshold fallback.
  const shipping = hasProductShipping ? productShipping : delivery.fee;
  const tax = (subtotal - discount) * settings.taxRate;
  const total = subtotal - discount + shipping + tax;

  // Create or reuse address
  const savedAddress = await db.address.create({
    data: { userId: session.user.id, type: "BOTH", ...address },
  });

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      addressId: savedAddress.id,
      status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      paymentMethod,
      deliveryMethod,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponCode: appliedCoupon ?? undefined,
      items: { create: orderItems },
    },
  });

  if (appliedCoupon) {
    await db.coupon.update({
      where: { code: appliedCoupon },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Decrement inventory
  for (const item of orderItems) {
    if (item.variantId) {
      await db.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
      await db.inventoryLog.create({
        data: {
          variantId: item.variantId,
          change: -item.quantity,
          reason: `Order ${order.orderNumber}`,
        },
      });
    }
  }

  // Notification
  await db.notification.create({
    data: {
      userId: session.user.id,
      type: "ORDER",
      title: "Order placed",
      message: `Your order ${order.orderNumber} has been received.`,
      link: `/dashboard/orders/${order.id}`,
    },
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, total }, { status: 201 });
}
