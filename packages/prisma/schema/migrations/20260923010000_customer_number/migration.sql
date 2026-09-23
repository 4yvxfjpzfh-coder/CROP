-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderNumber";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "customerNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_customerNumber_key" ON "User"("customerNumber");
