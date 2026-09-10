import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { ProductsWorkspace } from "./products-workspace";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin("redirect");

  const [products, pickupPoints] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { pickupPoint: { select: { id: true, shortName: true } } },
    }),
    prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ProductsWorkspace
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        photoUrl: p.photoUrl,
        quantity: p.quantity,
        originalPriceCents: p.originalPriceCents,
        discountPriceCents: p.discountPriceCents,
        pickupPointId: p.pickupPointId,
        pickupShortName: p.pickupPoint?.shortName ?? null,
        isActive: p.isActive,
      }))}
      pickupPoints={pickupPoints.map((pp) => ({
        id: pp.id,
        name: pp.name,
        shortName: pp.shortName,
        address: pp.address,
        latitude: pp.latitude,
        longitude: pp.longitude,
      }))}
    />
  );
}
