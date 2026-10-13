-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NONE', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO',
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "paypalOrderId" TEXT,
  ADD COLUMN "paypalCaptureId" TEXT,
  ADD COLUMN "fxRateUsed" DOUBLE PRECISION,
  ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_paypalOrderId_key" ON "Order"("paypalOrderId");

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "usdExchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 520;
