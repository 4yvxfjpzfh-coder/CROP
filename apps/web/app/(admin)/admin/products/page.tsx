import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { ProductsWorkspace } from "./products-workspace";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin("redirect");

  const [products, pickupPoints, farmers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { pickupPoint: { select: { id: true, shortName: true } } },
    }),
    prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "FARMER" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <ProductsWorkspace
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        providerName: p.providerName,
        farmerId: p.farmerId,
        photoUrl: p.photoUrl,
        harvestedAt: p.harvestedAt ? p.harvestedAt.toISOString().slice(0, 10) : null,
        ripenessNote: p.ripenessNote,
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
      farmers={farmers}
    />
  );
}
