-- Migrate pricing from Product (top-level) to ProductVariant, and replace the
-- hardcoded color/size columns with dynamic option attributes (JSONB).
-- Also introduces ProductOption / ProductOptionValue for admin-defined options.

-- 1. New tables for dynamic options -----------------------------------------
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOptionValue" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "ProductOption"("productId", "name");
CREATE INDEX "ProductOptionValue_optionId_idx" ON "ProductOptionValue"("optionId");
CREATE UNIQUE INDEX "ProductOptionValue_optionId_value_key" ON "ProductOptionValue"("optionId", "value");

ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_optionId_fkey"
  FOREIGN KEY ("optionId") REFERENCES "ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Extend ProductVariant (keep color/size for now to backfill attributes) ---
ALTER TABLE "ProductVariant" ADD COLUMN "attributes" JSONB;
ALTER TABLE "ProductVariant" ADD COLUMN "compareAtPrice" DECIMAL(12,2);

-- Backfill attributes from the old color/size columns for any existing variants.
UPDATE "ProductVariant"
SET "attributes" = jsonb_strip_nulls(jsonb_build_object('Color', "color", 'Size', "size"))
WHERE "attributes" IS NULL;

-- Give any existing variant without a price the product's old price (fallback 0).
UPDATE "ProductVariant" v
SET "price" = COALESCE((SELECT p."price" FROM "Product" p WHERE p."id" = v."productId"), 0)
WHERE v."price" IS NULL;

-- 3. Create a default variant for every product that has none -----------------
INSERT INTO "ProductVariant" ("id", "productId", "sku", "attributes", "stock", "price", "compareAtPrice")
SELECT gen_random_uuid()::text, p."id", p."sku", '{}'::jsonb, 99, p."price", p."compareAtPrice"
FROM "Product" p
WHERE NOT EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p."id");

-- 4. Drop the now-obsolete columns -------------------------------------------
ALTER TABLE "ProductVariant" DROP COLUMN "color";
ALTER TABLE "ProductVariant" DROP COLUMN "size";
ALTER TABLE "ProductVariant" ALTER COLUMN "price" SET NOT NULL;

-- 5. Product: drop top-level price/compareAtPrice, add denormalized minPrice ---
ALTER TABLE "Product" DROP COLUMN "compareAtPrice";
ALTER TABLE "Product" DROP COLUMN "price";
ALTER TABLE "Product" ADD COLUMN "minPrice" DECIMAL(12,2);

UPDATE "Product" p
SET "minPrice" = (
  SELECT MIN(v."price") FROM "ProductVariant" v WHERE v."productId" = p."id"
);
