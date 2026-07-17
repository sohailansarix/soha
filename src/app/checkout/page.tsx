"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, Truck, MapPin, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/components/currency/currency-provider";
import { cn } from "@/lib/utils";
import { DEFAULT_STANDARD_FEE, DEFAULT_TAX_RATE, getDeliveryMethods, type DeliveryMethodDef } from "@/lib/constants";

const STEPS = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Delivery", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: ShoppingBag },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalSavings, clear } = useCart();
  const { toast } = useToast();
  const { format, currency } = useCurrency();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [delivery, setDelivery] = React.useState<"STANDARD" | "EXPRESS" | "SAME_DAY">("STANDARD");
  const [payment, setPayment] = React.useState<"STRIPE" | "RAZORPAY" | "COD">("COD");
  const [coupon, setCoupon] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = React.useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [validating, setValidating] = React.useState(false);
  const [productShipping, setProductShipping] = React.useState<number | null>(null);
  const [methods, setMethods] = React.useState<DeliveryMethodDef[]>(
    getDeliveryMethods({ standardShippingFee: DEFAULT_STANDARD_FEE, expressShippingFee: 0, sameDayShippingFee: 0, taxRate: DEFAULT_TAX_RATE }),
  );
  const [taxRate, setTaxRate] = React.useState(DEFAULT_TAX_RATE);

  React.useEffect(() => {
    fetch(`/api/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const settings = {
          standardShippingFee: data.standardShippingFee ?? DEFAULT_STANDARD_FEE,
          expressShippingFee: data.expressShippingFee ?? 0,
          sameDayShippingFee: data.sameDayShippingFee ?? 0,
          taxRate: data.taxRate ?? DEFAULT_TAX_RATE,
        };
        setMethods(getDeliveryMethods(settings));
        setTaxRate(settings.taxRate);
      })
      .catch(() => {});
  }, []);

  // Compute shipping the same way the cart does (and the /api/checkout server
  // calc): sum each product's product-specific shipping fee, applying its
  // free-shipping threshold per line. Falls back to null when no product
  // defines its own shipping.
  React.useEffect(() => {
    if (items.length === 0) {
      setProductShipping(null);
      return;
    }
    const ids = items.map((i) => i.productId);
    fetch(`/api/products/shipping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.products) return;
        const map = new Map<string, { id: string; shippingFee: number | null; freeShippingOver: number | null }>(
          data.products.map((p: { id: string; shippingFee: number | null; freeShippingOver: number | null }) => [p.id, p]),
        );
        let total = 0;
        let hasProductShipping = false;
        for (const item of items) {
          const p = map.get(item.productId);
          if (p?.shippingFee != null) {
            hasProductShipping = true;
            const lineSubtotal = item.price * item.quantity;
            const freeOver = p.freeShippingOver != null ? Number(p.freeShippingOver) : null;
            if (freeOver == null || lineSubtotal < freeOver) {
              total += Number(p.shippingFee) * item.quantity;
            }
          }
        }
        setProductShipping(hasProductShipping ? total : null);
      })
      .catch(() => setProductShipping(null));
  }, [items]);

  const deliveryFee = methods.find((d) => d.id === delivery)!.fee;
  // Prefer product-specific shipping (matching the cart) when any product
  // defines its own charge; otherwise fall back to the flat delivery fee for
  // the chosen method. No site-wide free-shipping threshold exists.
  const shipping =
    productShipping != null ? productShipping : subtotal === 0 ? 0 : deliveryFee;
  const discount = appliedCoupon?.discount ?? 0;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shipping + tax;

  async function applyCoupon() {
    const code = coupon.trim();
    if (!code) return;
    setValidating(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal, currency }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount: data.discount });
        setCouponMsg({ type: "ok", text: `Applied ${data.code} — you save ${format(data.discount)}` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: "err", text: data.error ?? "Invalid coupon" });
      }
    } catch {
      setCouponMsg({ type: "err", text: "Could not validate coupon" });
    } finally {
      setValidating(false);
    }
  }

  const addressValid = address.fullName && address.line1 && address.city && address.postalCode && address.country;

  async function placeOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
          })),
          address,
          deliveryMethod: delivery,
          paymentMethod: payment,
          couponCode: appliedCoupon?.code || coupon || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not place order");
      }
      const data = await res.json();
      clear();
      toast({ title: "Order placed!", description: data.orderNumber, variant: "success" });
      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch (e) {
      toast({
        title: "Checkout failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step === 1) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-2">
          {STEPS.map((s) => (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium",
                  step >= s.id ? "border-accent bg-accent text-accent-foreground" : "border-input text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-sm", step >= s.id ? "font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input id="fullName" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line1">Address line 1</Label>
                    <Input id="line1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line2">Address line 2 (optional)</Label>
                    <Input id="line2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal code</Label>
                      <Input id="postalCode" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                  </div>
                  <Button className="w-full" disabled={!addressValid} onClick={() => setStep(2)}>
                    Continue to delivery
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as typeof delivery)}>
                    {methods.map((d) => {
                      // When products define their own shipping, the real charge
                      // is product-specific (shown in the summary). Otherwise the
                      // flat fee for this method applies.
                      const fee = productShipping != null ? productShipping : d.fee;
                      return (
                        <label
                          key={d.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg border p-4 has-[:checked]:border-accent"
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={d.id} />
                            <div>
                              <div className="font-medium">{d.label}</div>
                              <div className="text-sm text-muted-foreground">{d.eta}</div>
                            </div>
                          </div>
                          <span className="font-medium">{fee === 0 ? "Free" : format(fee)}</span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={() => setStep(3)}>Continue to payment</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={payment} onValueChange={(v) => setPayment(v as typeof payment)}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-accent">
                      <RadioGroupItem value="COD" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-accent">
                      <RadioGroupItem value="STRIPE" />
                      <div>
                        <div className="font-medium">Card (Stripe)</div>
                        <div className="text-sm text-muted-foreground">Secure card payment</div>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-accent">
                      <RadioGroupItem value="RAZORPAY" />
                      <div>
                        <div className="font-medium">Razorpay</div>
                        <div className="text-sm text-muted-foreground">UPI, cards & wallets</div>
                      </div>
                    </label>
                  </RadioGroup>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button className="flex-1" onClick={() => setStep(4)}>Review order</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Confirm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Ship to</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {address.fullName}, {address.line1} {address.line2}, {address.city} {address.postalCode}, {address.country}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Items</h3>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {items.map((i) => (
                        <li key={`${i.productId}-${i.variantId ?? "b"}`} className="flex justify-between">
                          <span>{i.name} × {i.quantity}</span>
                          <span>{format(i.price * i.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Coupon code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value);
                          if (appliedCoupon) setAppliedCoupon(null);
                        }}
                        placeholder="e.g. WELCOME10"
                      />
                      <Button type="button" variant="outline" onClick={applyCoupon} disabled={validating || !coupon.trim()}>
                        {validating ? "…" : "Apply"}
                      </Button>
                    </div>
                    {couponMsg && (
                      <p className={cn("text-sm", couponMsg.type === "ok" ? "text-emerald-600" : "text-destructive")}>
                        {couponMsg.text}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button className="flex-1" onClick={placeOrder} disabled={loading}>
                      {loading ? "Placing order…" : `Place order · ${format(total)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{format(subtotal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>You saved</span>
                      <span>-{format(totalSavings)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
                      <span>-{format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : format(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                      <span>{format(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                      <span>{format(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
