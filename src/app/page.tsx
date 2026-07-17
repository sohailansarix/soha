import { SiteLayout } from "@/components/layout/site-layout";
import { Hero } from "@/components/home/hero";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { SectionHeading } from "@/components/product/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/constants";
import {
  getFeaturedCategories,
  getPopularBrands,
  getFlashSale,
  getBestSellers,
  getTrending,
  getNewArrivals,
} from "@/lib/products";

export default async function HomePage() {
  const [categories, brands, flash, best, trending, newest] = await Promise.all([
    getFeaturedCategories(),
    getPopularBrands(),
    getFlashSale(),
    getBestSellers(),
    getTrending(),
    getNewArrivals(),
  ]);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };

  return (
    <SiteLayout>
      <JsonLd data={orgLd} />
      <Hero />
      <CategoryShowcase categories={categories} />
      <PromoBanner />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="Flash Sale" subtitle="Limited-time deals you don't want to miss" href="/products?onSale=1" />
        <ProductGrid products={flash.products} />
      </section>

      <BrandShowcase brands={brands} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="Best Sellers" href="/products?sort=bestseller" />
        <ProductGrid products={best.products} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="Trending Now" href="/products?trending=1" />
        <ProductGrid products={trending.products} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="New Arrivals" href="/products?sort=newest" />
        <ProductGrid products={newest.products} />
      </section>

      <Testimonials />
      <Newsletter />
    </SiteLayout>
  );
}
