-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'FARMER';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "farmerId" TEXT;

-- CreateIndex
CREATE INDEX "Product_farmerId_idx" ON "Product"("farmerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
