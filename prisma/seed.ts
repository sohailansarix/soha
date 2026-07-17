import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Fashion", slug: "fashion", isFeatured: true, position: 1 },
  { name: "Electronics", slug: "electronics", isFeatured: true, position: 2 },
  { name: "Home & Living", slug: "home-living", isFeatured: true, position: 3 },
  { name: "Beauty", slug: "beauty", isFeatured: true, position: 4 },
  { name: "Accessories", slug: "accessories", isFeatured: true, position: 5 },
  { name: "Sports", slug: "sports", isFeatured: false, position: 6 },
];

const BRANDS = [
  { name: "Aurora", slug: "aurora", isFeatured: true },
  { name: "Nimbus", slug: "nimbus", isFeatured: true },
  { name: "Lumen", slug: "lumen", isFeatured: true },
  { name: "Verve", slug: "verve", isFeatured: true },
  { name: "Onyx", slug: "onyx", isFeatured: true },
  { name: "Solace", slug: "solace", isFeatured: false },
];

const BLOG_CATEGORIES = [
  { name: "Fashion", slug: "fashion", description: "Style tips, trends, and wardrobe essentials." },
  { name: "Beauty", slug: "beauty", description: "Skincare, makeup, and self-care guides." },
  { name: "Electronics", slug: "electronics", description: "Gadgets, reviews, and buying guides." },
  { name: "Home & Kitchen", slug: "home-kitchen", description: "Decor, organization, and kitchen essentials." },
  { name: "Lifestyle", slug: "lifestyle", description: "Everyday living and inspiration." },
  { name: "Health", slug: "health", description: "Wellness, fitness, and mindful living." },
  { name: "Technology", slug: "technology", description: "Tech news, how-tos, and innovations." },
  { name: "Shopping Guides", slug: "shopping-guides", description: "Curated picks and smart shopping tips." },
  { name: "Product Reviews", slug: "product-reviews", description: "Honest, in-depth product reviews." },
  { name: "Gift Ideas", slug: "gift-ideas", description: "Thoughtful gifts for every occasion." },
  { name: "Seasonal Collections", slug: "seasonal-collections", description: "Shop the season's best finds." },
  { name: "Company News", slug: "company-news", description: "Updates and announcements from SOHA." },
];

const PRODUCTS = [
  {
    name: "Merino Wool Sweater",
    category: "fashion",
    brand: "Aurora",
    price: 89.0,
    compareAtPrice: 120.0,
    summary: "Ultra-soft, breathable merino wool for all-season comfort.",
    description:
      "Crafted from premium merino wool, this sweater offers natural temperature regulation and a feather-light feel. A wardrobe essential with a minimal, timeless silhouette.",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    attributes: [
      { key: "Material", value: "100% Merino Wool" },
      { key: "Fit", value: "Regular" },
      { key: "Care", value: "Hand wash cold" },
    ],
    variants: [
      { color: "Charcoal", size: "M", stock: 12 },
      { color: "Charcoal", size: "L", stock: 8 },
      { color: "Camel", size: "M", stock: 10 },
    ],
  },
  {
    name: "Wireless Noise-Cancel Headphones",
    category: "electronics",
    brand: "Nimbus",
    price: 199.0,
    compareAtPrice: 249.0,
    summary: "Immersive sound with adaptive noise cancellation.",
    description:
      "Premium over-ear headphones with 40-hour battery life, adaptive ANC, and plush memory-foam ear cushions for all-day listening.",
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    attributes: [
      { key: "Battery", value: "40 hours" },
      { key: "Connectivity", value: "Bluetooth 5.3" },
      { key: "Weight", value: "250g" },
    ],
    variants: [
      { color: "Black", size: null, stock: 25 },
      { color: "Silver", size: null, stock: 18 },
    ],
  },
  {
    name: "Ceramic Pour-Over Set",
    category: "home-living",
    brand: "Lumen",
    price: 54.0,
    summary: "Minimalist ceramic brewer for the perfect cup.",
    description:
      "A beautifully glazed ceramic pour-over with a stainless filter. Designed for slow mornings and clean, crisp coffee.",
    isFeatured: true,
    isNewArrival: true,
    attributes: [
      { key: "Material", value: "Glazed ceramic" },
      { key: "Capacity", value: "600ml" },
    ],
    variants: [{ color: "Sand", size: null, stock: 30 }],
  },
  {
    name: "Hydrating Face Serum",
    category: "beauty",
    brand: "Verve",
    price: 38.0,
    compareAtPrice: 45.0,
    summary: "Lightweight hydration with hyaluronic acid.",
    description:
      "A fast-absorbing serum that plumps and hydrates with triple-weight hyaluronic acid and niacinamide. Fragrance-free and vegan.",
    isTrending: true,
    isBestSeller: true,
    attributes: [
      { key: "Volume", value: "30ml" },
      { key: "Skin type", value: "All" },
    ],
    variants: [{ color: null, size: "30ml", stock: 40 }],
  },
  {
    name: "Leather Card Wallet",
    category: "accessories",
    brand: "Onyx",
    price: 65.0,
    summary: "Full-grain leather, slim profile.",
    description:
      "Hand-finished full-grain leather wallet that ages beautifully. Holds cards and folded notes in a compact form.",
    isFeatured: true,
    attributes: [
      { key: "Material", value: "Full-grain leather" },
      { key: "Dimensions", value: "10 x 7 cm" },
    ],
    variants: [
      { color: "Tan", size: null, stock: 22 },
      { color: "Black", size: null, stock: 20 },
    ],
  },
  {
    name: "Performance Running Shoes",
    category: "sports",
    brand: "Solace",
    price: 129.0,
    compareAtPrice: 150.0,
    summary: "Responsive cushioning for daily miles.",
    description:
      "Engineered mesh upper with a responsive foam midsole. Built for comfort from the first mile to the last.",
    isTrending: true,
    attributes: [
      { key: "Drop", value: "8mm" },
      { key: "Weight", value: "240g" },
    ],
    variants: [
      { color: "Blue", size: "42", stock: 15 },
      { color: "Blue", size: "43", stock: 12 },
      { color: "Grey", size: "42", stock: 9 },
    ],
  },
  {
    name: "Linen Throw Blanket",
    category: "home-living",
    brand: "Lumen",
    price: 72.0,
    summary: "Stonewashed linen for cozy evenings.",
    description:
      "Breathable stonewashed linen throw that gets softer with every wash. A quiet luxury for your living space.",
    isNewArrival: true,
    attributes: [{ key: "Material", value: "100% Linen" }, { key: "Size", value: "130 x 170 cm" }],
    variants: [{ color: "Oat", size: null, stock: 28 }],
  },
  {
    name: "Smart Desk Lamp",
    category: "electronics",
    brand: "Nimbus",
    price: 95.0,
    summary: "Adaptive lighting with app control.",
    description:
      "A sleek LED desk lamp with tunable white light, touch dimming, and scheduling via companion app.",
    isFeatured: true,
    isBestSeller: true,
    attributes: [{ key: "Brightness", value: "800 lm" }, { key: "Power", value: "USB-C" }],
    variants: [{ color: "White", size: null, stock: 35 }],
  },
];

async function main() {
  console.log("Seeding database…");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await db.user.upsert({
    where: { email: "admin@soha.dev" },
    update: {},
    create: {
      name: "SOHA Admin",
      email: "admin@soha.dev",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Demo customer
  const custPassword = await bcrypt.hash("customer123", 12);
  await db.user.upsert({
    where: { email: "customer@soha.dev" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@soha.dev",
      password: custPassword,
      role: "CUSTOMER",
    },
  });

  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const created = await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    catMap.set(c.slug, created.id);
  }

  const brandMap = new Map<string, string>();
  for (const b of BRANDS) {
    const created = await db.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandMap.set(b.slug, created.id);
  }

  for (const c of BLOG_CATEGORIES) {
    await db.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }
  console.log(`Seeded ${BLOG_CATEGORIES.length} blog categories.`);

  for (const p of PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const sku = `SOHA-${slug.slice(0, 6).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const variantSeed = p.variants.map((v) => ({
      sku: `${sku}-${(v.color ?? "x").toUpperCase()}-${(v.size ?? "x").toUpperCase()}`,
      attributes: Object.fromEntries(
        Object.entries({ Color: v.color, Size: v.size }).filter(([, val]) => val != null),
      ),
      stock: v.stock,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
    }));
    const product = await db.product.upsert({
      where: { slug },
      update: {
        isFeatured: p.isFeatured ?? false,
        isBestSeller: p.isBestSeller ?? false,
        isTrending: p.isTrending ?? false,
        isNewArrival: p.isNewArrival ?? false,
        minPrice: Math.min(...variantSeed.map((v) => v.price)),
      },
      create: {
        name: p.name,
        slug,
        sku,
        description: p.description,
        summary: p.summary,
        categoryId: catMap.get(p.category)!,
        brandId: brandMap.get(p.brand)!,
        isActive: true,
        isFeatured: p.isFeatured ?? false,
        isBestSeller: p.isBestSeller ?? false,
        isTrending: p.isTrending ?? false,
        isNewArrival: p.isNewArrival ?? false,
        rating: 4.5,
        reviewCount: 2,
        minPrice: Math.min(...variantSeed.map((v) => v.price)),
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/${slug}-1/800/800`,
              alt: p.name,
              position: 0,
            },
            {
              url: `https://picsum.photos/seed/${slug}-2/800/800`,
              alt: p.name,
              position: 1,
            },
          ],
        },
        attributes: { create: p.attributes },
        variants: { create: variantSeed },
      },
    });

    // Approved reviews
    const customer = await db.user.findUnique({ where: { email: "customer@soha.dev" } });
    if (customer) {
      await db.review.upsert({
        where: { userId_productId: { userId: customer.id, productId: product.id } },
        update: {},
        create: {
          userId: customer.id,
          productId: product.id,
          rating: 5,
          title: "Love it",
          comment: "Exactly as described and great quality. Highly recommend.",
          isApproved: true,
        },
      });
    }
  }

  // Coupon
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "percentage",
      value: 10,
      minOrder: 0,
      isActive: true,
    },
  });

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
