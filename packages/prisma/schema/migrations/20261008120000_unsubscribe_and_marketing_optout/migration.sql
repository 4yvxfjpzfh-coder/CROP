-- Baja de correos de novedades y token del enlace "darse de baja".
ALTER TABLE "User" ADD COLUMN "marketingOptOutAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "unsubscribeToken" TEXT;
CREATE UNIQUE INDEX "User_unsubscribeToken_key" ON "User"("unsubscribeToken");
