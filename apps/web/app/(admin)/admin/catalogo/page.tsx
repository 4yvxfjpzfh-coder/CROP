import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
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
  const t = await getSiteTexts();

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
        {t["admin.catalogo_orden.heading"]}
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        {t["admin.catalogo_orden.subtext"]}
      </p>

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-olive">
        {t["admin.catalogo_orden.destacados_heading"]} ({inCatalog.length})
      </h2>
      {inCatalog.length === 0 ? (
        <p className="mb-10 font-[family-name:var(--font-form)] text-sm text-stone">
          {t["admin.catalogo_orden.destacados_empty"]}
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
                  aria-label={t["admin.catalogo_orden.subir"]}
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
                  aria-label={t["admin.catalogo_orden.bajar"]}
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
                  {t["admin.catalogo_orden.quitar"]}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-olive">
        {t["admin.catalogo_orden.sin_destacar_heading"]} ({notInCatalog.length})
      </h2>
      {notInCatalog.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          {t["admin.catalogo_orden.sin_destacar_empty"]}
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
                  {t["admin.catalogo_orden.destacar_primero"]}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
