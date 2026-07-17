import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[420px] w-full">
        {/* Decorative gradient hero (replace with real image via Cloudinary in production) */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(176,141,87,0.25),transparent_50%)]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4 sm:px-6 lg:px-8">
          <span className="mb-4 inline-block rounded-full border border-accent/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
            New Collection 2026
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Elegance, delivered to your door.
          </h1>
          <p className="mt-4 max-w-lg text-base text-neutral-300 sm:text-lg">
            Discover curated, premium products with a shopping experience designed around you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/products">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
