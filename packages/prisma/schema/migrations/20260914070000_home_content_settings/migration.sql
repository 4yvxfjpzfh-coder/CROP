-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "homeHeadline" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "homeSubtext" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "pickupWindowHours" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "HomeFruit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFruit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeFruit_position_idx" ON "HomeFruit"("position");
