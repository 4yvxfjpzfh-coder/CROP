import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@crop/prisma";
import { Catalog3D } from "../catalog-3d";
import type { CatalogProduct } from "../catalog-types";
import { getHomeBackgroundUrl } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pickupPointId: string }>;
}) {
  const { pickupPointId } = await params;
  const pickupPoint = await prisma.pickupPoint.findUnique({ where: { id: pickupPointId } });
  return {
    title: pickupPoint ? `${pickupPoint.shortName} — Catálogo — Crop` : "Catálogo — Crop",
    description: "Recorré el excedente disponible en esta feria.",
  };
}

export default async function CatalogoFeriaPage({
  params,
}: {
  params: Promise<{ pickupPointId: string }>;
}) {
  const { pickupPointId } = await params;
  const backgroundUrl = await getHomeBackgroundUrl();

  const pickupPoint = await prisma.pickupPoint.findUnique({ where: { id: pickupPointId } });
  if (!pickupPoint) notFound();

  const products = await prisma.product.findMany({
    // Curado a mano desde /admin/catalogo, y ahora también filtrado a esta
    // feria puntual (antes /catalogo mezclaba todas las ferias en una fila).
    where: {
      isActive: true,
      quantity: { gt: 0 },
      catalogPosition: { not: null },
      pickupPointId,
    },
    orderBy: { catalogPosition: "asc" },
    include: { pickupPoint: { select: { shortName: true } } },
    take: 60,
  });

  const items: CatalogProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    providerName: p.providerName,
    photoUrl: p.photoUrl,
    harvestedAt: p.harvestedAt ? p.harvestedAt.toISOString() : null,
    ripenessNote: p.ripenessNote,
    quantity: p.quantity,
    originalPriceCents: p.originalPriceCents,
    discountPriceCents: p.discountPriceCents,
    pickupShortName: p.pickupPoint?.shortName ?? null,
  }));

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {pickupPoint.shortName}
        </h1>
        <p className="text-sm text-neutral-600">
          Todavía no hay excedente en esta feria. Volvé pronto.
        </p>
        <Link href="/catalogo" className="text-sm text-neutral-700 underline underline-offset-2">
          Ver otras ferias
        </Link>
      </main>
    );
  }

  return (
    <Catalog3D
      products={items}
      backgroundUrl={backgroundUrl}
      feriaName={pickupPoint.shortName}
      backHref="/catalogo"
    />
  );
}
