import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent to-amber-700 p-8 text-white">
          <h3 className="text-xl font-bold">Free shipping on select items</h3>
          <p className="mt-2 text-sm text-white/80">
            Free standard shipping is available on eligible products — check each item's details to see if it qualifies.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-8 text-white">
          <h3 className="text-xl font-bold">Members get more</h3>
          <p className="mt-2 text-sm text-white/80">
            Early access to drops, exclusive coupons, and a smoother checkout.
          </p>
          <Button asChild variant="accent" className="mt-4">
            <Link href="/auth/register">Create account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
