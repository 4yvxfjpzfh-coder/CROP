-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "paypalPendingOrderId" TEXT,
  ADD COLUMN "paypalPendingCreatedAt" TIMESTAMP(3);
