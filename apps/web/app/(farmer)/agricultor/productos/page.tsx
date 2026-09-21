import { prisma } from "@crop/prisma";
import { requireFarmer } from "@/lib/farmer-guard";
import { FarmerProductsWorkspace } from "./workspace";

export const dynamic = "force-dynamic";

export default async function FarmerProductsPage() {
  const actor = await requireFarmer("redirect");

  const [products, pickupPoints] = await Promise.all([
    prisma.product.findMany({
      where: { farmerId: actor.id },
      orderBy: { createdAt: "desc" },
      include: { pickupPoint: { select: { id: true, shortName: true } } },
    }),
    prisma.pickupPoint.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <FarmerProductsWorkspace
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        photoUrl: p.photoUrl,
        unit: p.unit,
        quantity: p.quantity,
        originalPriceCents: p.originalPriceCents,
        discountPriceCents: p.discountPriceCents,
        pickupPointId: p.pickupPointId,
        pickupShortName: p.pickupPoint?.shortName ?? null,
        isActive: p.isActive,
        farmerSeq: p.farmerSeq,
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
