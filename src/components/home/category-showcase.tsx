import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/product/section-heading";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count?: { products: number };
}

export function CategoryShowcase({ categories }: { categories: CategoryItem[] }) {
  if (!categories.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title="Featured Categories" href="/categories" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
          >
            {c.image ? (
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
              <span className="text-sm font-semibold text-white">{c.name}</span>
              <span className="text-xs text-white/70">{c._count?.products ?? 0} items</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
