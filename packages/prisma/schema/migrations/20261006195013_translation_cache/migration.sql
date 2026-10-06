-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Translation_lang_idx" ON "Translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_lang_sourceHash_key" ON "Translation"("lang", "sourceHash");
