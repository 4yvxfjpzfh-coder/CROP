-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('RESERVED', 'PICKED_UP', 'CANCELLED', 'EXPIRED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'RESERVED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_discountCodeId_fkey";

-- DropIndex
DROP INDEX "Order_stripePaymentId_key";

-- DropIndex
DROP INDEX "Order_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "discountAmount",
DROP COLUMN "discountCodeId",
DROP COLUMN "stripePaymentId",
DROP COLUMN "stripeSessionId",
ADD COLUMN     "pickupBy" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'RESERVED';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productName",
DROP COLUMN "unitAmount",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "unitPriceCents" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "originalPriceCents" INTEGER NOT NULL,
    "discountPriceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_businessId_isActive_idx" ON "Product"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "Order_status_pickupBy_idx" ON "Order"("status", "pickupBy");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

