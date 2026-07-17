import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { ProductReviews } from "@/components/product/product-reviews";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { ProductGallery } from "@/components/product/product-gallery";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductBySlug } from "@/lib/products";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.summary ?? product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.summary ?? undefined,
      images: product.images.map((i) => ({ url: i.url })),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currency = await getActiveCurrency();
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  // Pricing now lives on variants; the cheapest variant seeds the cart default.
  const sortedVariants = [...product.variants].sort((a, b) => Number(a.price) - Number(b.price));

  const relatedProducts: ProductCardData[] = product.related.map((r) => {
    const rv = [...r.related.variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
    return {
      id: r.related.id,
      slug: r.related.slug,
      name: r.related.name,
      price: rv ? Number(rv.price) : 0,
      compareAtPrice: rv?.compareAtPrice ? Number(rv.compareAtPrice) : null,
      image: r.related.images[0]?.url ?? null,
      rating: Number(r.related.rating),
      reviewCount: r.related.reviewCount,
      stock: 99,
    };
  });

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary ?? product.description,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: sortedVariants[0] ? Number(sortedVariants[0].price) : 0,
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/products/${product.slug}`,
    },
  };

  return (
    <SiteLayout>
      <JsonLd data={productLd} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Info + purchase */}
          <div>
            {product.brand && (
              <Link
                href={`/products?brand=${product.brand.slug}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>

            {product.summary && (
              <p className="mt-4 text-muted-foreground">{product.summary}</p>
            )}

            <Separator className="my-6" />

            <AddToCartPanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={sortedVariants[0] ? Number(sortedVariants[0].price) : 0}
              variants={product.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                attributes: (v.attributes as Record<string, string>) ?? {},
                stock: v.stock,
                price: v.price ? Number(v.price) : null,
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              }))}
              totalStock={totalStock}
              image={product.images[0]?.url ?? null}
              currency={currency}
            />

            <Separator className="my-6" />

            <Accordion type="multiple" defaultValue={["desc", "specs"]}>
              <AccordionItem value="desc">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
              {product.attributes.length > 0 && (
                <AccordionItem value="specs">
                  <AccordionTrigger>Specifications</AccordionTrigger>
                  <AccordionContent>
                    <dl className="divide-y text-sm">
                      {product.attributes.map((a) => (
                        <div key={a.id} className="flex justify-between py-2">
                          <dt className="text-muted-foreground">{a.key}</dt>
                          <dd className="font-medium">{a.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="ship">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    {product.shippingFee != null ? (
                      <p>
                        Delivery charge of {formatMoney(product.shippingFee, currency)}
                        {product.freeShippingOver != null
                          ? ` — free when your order subtotal reaches ${formatMoney(product.freeShippingOver, currency)}.`
                          : "."}
                      </p>
                    ) : (
                      <p>Free standard shipping on orders over {formatMoney(75, currency)}.</p>
                    )}
                    <p>
                      {product.isReturnable
                        ? product.returnWindow
                          ? `Returnable within ${product.returnWindow} days of delivery.`
                          : "This item is returnable."
                        : "This item is not returnable."}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <Suspense fallback={<div className="h-40" />}>
            <ProductReviews productId={product.id} reviews={product.reviews} rating={Number(product.rating)} reviewCount={product.reviewCount} />
          </Suspense>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
