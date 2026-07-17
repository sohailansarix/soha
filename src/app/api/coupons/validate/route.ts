import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/currency";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0).optional(),
  currency: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }

  const { code, subtotal = 0 } = parsed.data;
  const session = await auth();
  const currency = parsed.data.currency ?? session?.user?.currency ?? DEFAULT_CURRENCY;
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, error: "Invalid or inactive coupon" });
  }

  const now = new Date();
  const reasons: string[] = [];
  if (coupon.startsAt && coupon.startsAt > now) reasons.push("not yet active");
  if (coupon.expiresAt && coupon.expiresAt < now) reasons.push("expired");
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) reasons.push("fully redeemed");
  if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
    reasons.push(`requires a minimum order of ${formatMoney(Number(coupon.minOrder), currency)}`);
  }
  // Per-user usage limit.
  if (coupon.perUserLimit !== null && session?.user) {
    const userUses = await db.order.count({
      where: { userId: session.user.id, couponCode: coupon.code },
    });
    if (userUses >= coupon.perUserLimit) {
      reasons.push(`limited to ${coupon.perUserLimit} use(s) per customer`);
    }
  }

  if (reasons.length > 0) {
    return NextResponse.json({ valid: false, error: `Coupon ${reasons.join(", ")}` });
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discount: Math.min(discount, subtotal),
  });
}
