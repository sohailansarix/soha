-- AlterTable
ALTER TABLE "Product" DROP COLUMN "returns",
DROP COLUMN "shipping",
ADD COLUMN     "freeShippingOver" DECIMAL(12,2),
ADD COLUMN     "isReturnable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "returnWindow" INTEGER,
ADD COLUMN     "shippingFee" DECIMAL(12,2);
