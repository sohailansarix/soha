import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/product/section-heading";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export function BrandShowcase({ brands }: { brands: BrandItem[] }) {
  if (!brands.length) return null;
  return (
    <section className="border-y bg-secondary/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Popular Brands" href="/brands" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.slug}`}
              className="flex aspect-[3/2] items-center justify-center rounded-lg border bg-background p-4 transition-colors hover:border-accent"
            >
              {b.logo ? (
                <Image src={b.logo} alt={b.name} width={120} height={60} className="object-contain" />
              ) : (
                <span className="text-sm font-semibold">{b.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
