-- AlterTable
ALTER TABLE "Product" ADD COLUMN "catalogPosition" INTEGER;

-- CreateIndex
CREATE INDEX "Product_catalogPosition_idx" ON "Product"("catalogPosition");
