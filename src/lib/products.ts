import { db } from "@/lib/db";
import type { ProductCardData } from "@/components/product/product-card";

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "bestseller" | "rating" | "popular";
  page?: number;
  perPage?: number;
  onSale?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  ids?: string[];
}

const DEFAULT_PER_PAGE = 12;

export async function getProducts(query: ProductQuery = {}): Promise<{
  products: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(60, query.perPage ?? DEFAULT_PER_PAGE);
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.category) where.category = { slug: query.category };
  if (query.brand) where.brand = { slug: query.brand };
  if (query.minPrice !== undefined) where.minPrice = { ...(where.minPrice as object), gte: query.minPrice };
  if (query.maxPrice !== undefined) where.minPrice = { ...(where.minPrice as object), lte: query.maxPrice };
  if (query.onSale) where.variants = { some: { compareAtPrice: { not: null } } };
  if (query.featured) where.isFeatured = true;
  if (query.bestSeller) where.isBestSeller = true;
  if (query.trending) where.isTrending = true;
  if (query.newArrival) where.isNewArrival = true;
  if (query.ids) where.id = { in: query.ids };

  const orderBy: Record<string, string>[] = [{ createdAt: "desc" }];
  switch (query.sort) {
    case "price-asc":
      orderBy.length = 0;
      orderBy.push({ minPrice: "asc" });
      break;
    case "price-desc":
      orderBy.length = 0;
      orderBy.push({ minPrice: "desc" });
      break;
    case "bestseller":
      orderBy.length = 0;
      orderBy.push({ isBestSeller: "desc" });
      break;
    case "rating":
      orderBy.length = 0;
      orderBy.push({ rating: "desc" });
      break;
    case "popular":
      orderBy.length = 0;
      orderBy.push({ reviewCount: "desc" });
      break;
  }

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        brand: true,
        variants: { orderBy: [{ price: "asc" }], take: 1 },
      },
    }),
    db.product.count({ where }),
  ]);

  const products: ProductCardData[] = rows.map((p) => {
    const cheapest = p.variants[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: cheapest ? Number(cheapest.price) : 0,
      compareAtPrice: cheapest?.compareAtPrice ? Number(cheapest.compareAtPrice) : null,
      image: p.images[0]?.url ?? null,
      rating: Number(p.rating),
      reviewCount: p.reviewCount,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      stock: 99,
    };
  });

  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      variants: true,
      attributes: true,
      reviews: { where: { isApproved: true }, include: { user: true }, orderBy: { createdAt: "desc" } },
      related: { include: { related: { include: { images: { take: 1 }, variants: true } } } },
    },
  });
}

export async function getFeaturedCategories(limit = 6) {
  return db.category.findMany({
    where: { isFeatured: true },
    take: limit,
    include: { _count: { select: { products: true } } },
    orderBy: { position: "asc" },
  });
}

export async function getPopularBrands(limit = 8) {
  return db.brand.findMany({
    where: { isFeatured: true },
    take: limit,
    include: { _count: { select: { products: true } } },
  });
}

export async function getFlashSale(limit = 8) {
  return getProducts({ onSale: true, sort: "popular", perPage: limit });
}

export async function getBestSellers(limit = 8) {
  return getProducts({ bestSeller: true, sort: "bestseller", perPage: limit });
}

export async function getTrending(limit = 8) {
  return getProducts({ trending: true, sort: "popular", perPage: limit });
}

export async function getNewArrivals(limit = 8) {
  return getProducts({ newArrival: true, sort: "newest", perPage: limit });
}
