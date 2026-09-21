import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { colones } from "../products/types";
import { addToCatalog, removeFromCatalog, moveUp, moveDown } from "./actions";

export const dynamic = "force-dynamic";

const rowMeta = (p: {
  discountPriceCents: number;
  pickupPoint: { shortName: string } | null;
}) =>
  `${colones(p.discountPriceCents)}${p.pickupPoint ? ` · ${p.pickupPoint.shortName}` : ""}`;

export default async function AdminCatalogPage() {
  await requireAdmin("redirect");

  const products = await prisma.product.findMany({
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: [{ catalogPosition: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    include: { pickupPoint: { select: { shortName: true } } },
  });

  const inCatalog = products.filter((p) => p.catalogPosition !== null);
  const notInCatalog = products.filter((p) => p.catalogPosition === null);

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Orden del catálogo
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Todo producto visible y con stock aparece solo en{" "}
        <a href="/catalogo" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          /catalogo
        </a>
        , no hace falta agregarlo a mano. Acá podés destacar algunos poniéndolos
        primero; el resto se ordena por fecha de publicación.
      </p>

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-olive">
        Destacados, con orden fijo ({inCatalog.length})
      </h2>
      {inCatalog.length === 0 ? (
        <p className="mb-10 font-[family-name:var(--font-form)] text-sm text-stone">
          Ninguno todavía.
        </p>
      ) : (
        <ul className="mb-10 divide-y divide-cream-200 border-y border-cream-200">
          {inCatalog.map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <span className="w-5 font-[family-name:var(--font-form)] text-sm text-stone">
                {i + 1}
              </span>
              <span className="flex-1 font-[family-name:var(--font-display)] text-base text-olive">
                {p.name}
                <span className="ml-2 font-[family-name:var(--font-form)] text-xs text-stone">
                  {rowMeta(p)}
                </span>
              </span>
              <form action={moveUp}>
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  disabled={i === 0}
                  aria-label="Subir"
                  className="px-2 text-stone disabled:opacity-30"
                >
                  ↑
                </button>
              </form>
              <form action={moveDown}>
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  disabled={i === inCatalog.length - 1}
                  aria-label="Bajar"
                  className="px-2 text-stone disabled:opacity-30"
                >
                  ↓
                </button>
              </form>
              <form action={removeFromCatalog}>
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  className="font-[family-name:var(--font-form)] text-sm text-sienna underline underline-offset-4"
                >
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-olive">
        Sin destacar, ordenados por fecha ({notInCatalog.length})
      </h2>
      {notInCatalog.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          No hay más productos disponibles sin destacar.
        </p>
      ) : (
        <ul className="divide-y divide-cream-200 border-y border-cream-200">
          {notInCatalog.map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <span className="flex-1 font-[family-name:var(--font-display)] text-base text-olive">
                {p.name}
                <span className="ml-2 font-[family-name:var(--font-form)] text-xs text-stone">
                  {rowMeta(p)}
                </span>
              </span>
              <form action={addToCatalog}>
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  className="font-[family-name:var(--font-form)] text-sm text-olive underline underline-offset-4"
                >
                  Destacar primero
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
