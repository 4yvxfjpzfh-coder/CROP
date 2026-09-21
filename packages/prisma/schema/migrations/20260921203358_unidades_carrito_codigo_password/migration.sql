-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('UNIDAD', 'KG');

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "farmerSeq" INTEGER,
ADD COLUMN     "unit" "ProductUnit" NOT NULL DEFAULT 'UNIDAD',
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "pickupWindowHours" SET DEFAULT 2;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;
