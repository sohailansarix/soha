import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CURRENCIES } from "@/lib/currency";
import { CouponForm } from "../../coupon-form";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  const isFixed = coupon.type === "FIXED";
  // FIXED values are stored as USD base; show them in INR in the form.
  const displayValue = isFixed ? Number(coupon.value) * CURRENCIES.INR.rate : Number(coupon.value);
  const displayMinOrder = coupon.minOrder ? Number(coupon.minOrder) * CURRENCIES.INR.rate : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Coupon</h1>
      <CouponForm
        id={id}
        defaultValues={{
          code: coupon.code,
          type: coupon.type as "PERCENTAGE" | "FIXED",
          value: displayValue,
          minOrder: displayMinOrder,
          maxUses: coupon.maxUses ?? undefined,
          perUserLimit: coupon.perUserLimit ?? undefined,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 10) : "",
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
