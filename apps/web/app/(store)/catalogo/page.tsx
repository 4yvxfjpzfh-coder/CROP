import Link from "next/link";
import { prisma } from "@crop/prisma";
import { Catalog3D } from "./catalog-3d";
import type { CatalogProduct } from "./catalog-types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo — Crop",
  description: "Recorré el excedente disponible en la feria del agricultor.",
};

export default async function CatalogoPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    include: { pickupPoint: { select: { shortName: true } } },
    take: 60,
  });

  const items: CatalogProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    photoUrl: p.photoUrl,
    quantity: p.quantity,
    originalPriceCents: p.originalPriceCents,
    discountPriceCents: p.discountPriceCents,
    pickupShortName: p.pickupPoint?.shortName ?? null,
  }));

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Catálogo</h1>
        <p className="text-sm text-neutral-600">
          Todavía no hay excedente publicado. Volvé pronto.
        </p>
        <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
          Inicio
        </Link>
      </main>
    );
  }

  return <Catalog3D products={items} />;
}
