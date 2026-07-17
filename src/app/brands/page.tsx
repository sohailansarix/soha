import Link from "next/link";
import { db } from "@/lib/db";
import { SectionHeading } from "@/components/product/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container py-10">
      <SectionHeading title="Our Brands" subtitle="Quality labels we partner with" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/products?brand=${b.slug}`}>
            <Card className="transition hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{b.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b._count.products} products</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
