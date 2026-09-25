import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@crop/prisma";
import { CatalogGrid } from "../catalog-grid";
import type { CatalogProduct } from "../catalog-types";
import { getHomeBackgroundUrl } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { productCode } from "@/lib/units";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pickupPointId: string }>;
}) {
  const { pickupPointId } = await params;
  const [pickupPoint, t] = await Promise.all([
    prisma.pickupPoint.findUnique({ where: { id: pickupPointId } }),
    getSiteTexts(),
  ]);
  return {
    title: pickupPoint
      ? `${pickupPoint.shortName} — ${t["nav.catalogo"]} — ${t["brand.name"]}`
      : `${t["nav.catalogo"]} — ${t["brand.name"]}`,
    description: t["catalogo.feria.meta_description"],
  };
}

export default async function CatalogoFeriaPage({
  params,
}: {
  params: Promise<{ pickupPointId: string }>;
}) {
  const { pickupPointId } = await params;
  const [backgroundUrl, t] = await Promise.all([getHomeBackgroundUrl(), getSiteTexts()]);

  const pickupPoint = await prisma.pickupPoint.findUnique({ where: { id: pickupPointId } });
  if (!pickupPoint) notFound();

  const products = await prisma.product.findMany({
    // Se muestran todos los productos activos con stock de esta feria; ya no
    // hace falta que el admin los agregue a mano uno por uno. El orden manual
    // desde /admin/catalogo sigue existiendo, pero es opcional: solo mueve al
    // frente lo que el admin quiera destacar, el resto entra igual por fecha.
    where: {
      isActive: true,
      quantity: { gt: 0 },
      pickupPointId,
    },
    orderBy: [
      { catalogPosition: { sort: "asc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    include: {
      pickupPoint: { select: { shortName: true } },
      farmer: { select: { name: true } },
    },
    take: 200,
  });

  const items: CatalogProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    providerName: p.providerName,
    photoUrl: p.photoUrl,
    harvestedAt: p.harvestedAt ? p.harvestedAt.toISOString() : null,
    ripenessNote: p.ripenessNote,
    unit: p.unit,
    quantity: p.quantity,
    originalPriceCents: p.originalPriceCents,
    discountPriceCents: p.discountPriceCents,
    pickupShortName: p.pickupPoint?.shortName ?? null,
    code: productCode({
      name: p.name,
      farmerName: p.farmer?.name ?? p.providerName ?? null,
      farmerSeq: p.farmerSeq,
    }),
  }));

  // Google Maps entiende este link universal en cualquier plataforma: abre
  // la app instalada (Google Maps en Android, o la que corresponda en iOS)
  // o cae a la version web si no hay ninguna. Coordenadas si existen, si no
  // la direccion en texto.
  const mapsUrl =
    pickupPoint.latitude != null && pickupPoint.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${pickupPoint.latitude},${pickupPoint.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupPoint.address)}`;

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {pickupPoint.shortName}
        </h1>
        <p className="text-sm text-neutral-600">
          {t["catalogo.feria.empty"]}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-700 underline underline-offset-2"
        >
          {t["catalogo.feria.como_llegar"]}
        </a>
        <Link href="/catalogo" className="text-sm text-neutral-700 underline underline-offset-2">
          {t["catalogo.feria.volver"]}
        </Link>
      </main>
    );
  }

  return (
    <CatalogGrid
      products={items}
      backgroundUrl={backgroundUrl}
      feriaName={pickupPoint.shortName}
      backHref="/catalogo"
      mapsUrl={mapsUrl}
      pickupDay={pickupPoint.pickupDay}
      texts={t}
    />
  );
}
