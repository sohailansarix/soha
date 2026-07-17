import Link from "next/link";
import { db } from "@/lib/db";
import { SectionHeading } from "@/components/product/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { products: true } }, children: true },
  });

  return (
    <div className="container py-10">
      <SectionHeading title="Shop by Category" subtitle="Browse our curated collections" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/products?category=${c.slug}`}>
            <Card className="group relative overflow-hidden transition hover:shadow-md">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
              <CardContent className="relative p-6">
                <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                <p className="mt-1 text-sm text-white/80">{c._count.products} products</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
