import Link from "next/link";
import { prisma } from "@crop/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { getLang } from "@/lib/i18n";
import { SiteBackground } from "@/components/site-background";
import { Press } from "@/components/motion/press";
import { Reveal } from "@/components/motion/reveal";
import { CATEGORIES, categoryOf, isCategoryId, type CategoryId } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return {
    title: `${t["nav.catalogo"]} — ${t["brand.name"]}`,
    description: t["catalogo.selector.subtext"],
  };
}

/**
 * Selector de feria: cada punto de recogida tiene su propio catálogo
 * (/catalogo/[pickupPointId]), para ver Santa Ana o Escazú por separado.
 *
 * Con ?categoria=<id> (viene de los banners del inicio) filtra qué ferias
 * mostrar a las que de verdad tienen algo de esa sección, y le pasa el
 * filtro a cada feria para que abra ya mismo en esa sección.
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const category: CategoryId | null = isCategoryId(categoria) ? categoria : null;

  const [settings, t, lang, pickupPoints] = await Promise.all([
    getSiteSettings(),
    getSiteTexts(),
    getLang(),
    prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, quantity: { gt: 0 } },
            },
          },
        },
      },
    }),
  ]);

  // La sección de un producto se adivina por el nombre en el servidor (no
  // está siempre guardada en la base), así que para contar por feria hace
  // falta traer nombre + categoría a mano de cada producto activo. Liviano:
  // sin fotos ni descripciones, y solo cuando hay un filtro de categoría.
  let countByPickupPoint: Map<string, number> | null = null;
  if (category) {
    const products = await prisma.product.findMany({
      where: { isActive: true, quantity: { gt: 0 }, pickupPointId: { not: null } },
      select: { pickupPointId: true, name: true, category: true },
    });
    countByPickupPoint = new Map();
    for (const p of products) {
      if (categoryOf(p) !== category) continue;
      const key = p.pickupPointId!;
      countByPickupPoint.set(key, (countByPickupPoint.get(key) ?? 0) + 1);
    }
  }

  const visiblePickupPoints = category
    ? pickupPoints.filter((pp) => (countByPickupPoint?.get(pp.id) ?? 0) > 0)
    : pickupPoints;

  const categoryInfo = category ? CATEGORIES.find((c) => c.id === category) : null;
  const categoryName = categoryInfo ? (lang === "en" ? categoryInfo.labelEn : categoryInfo.label) : null;

  return (
    <div className="min-h-dvh text-paper">
      <SiteBackground url={settings.homeBackgroundUrl} />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl uppercase text-paper hover:opacity-80"
        >
          <span aria-hidden>←</span> {t["brand.name"]}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <Reveal>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-paper md:text-4xl">
            {categoryName
              ? `${t["catalogo.selector.heading"]} · ${categoryName}`
              : t["catalogo.selector.heading"]}
          </h1>
          <p className="mt-3 max-w-lg font-[family-name:var(--font-form)] text-sm leading-relaxed text-metal">
            {t["catalogo.selector.subtext"]}
          </p>
          {categoryInfo && (
            <Link
              href="/catalogo"
              className="mt-3 inline-flex items-center gap-2 font-[family-name:var(--font-form)] text-sm text-metal underline underline-offset-2 hover:text-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={categoryInfo.image} alt="" className="size-6 rounded-full" />
              {t["catalogo.selector.quitar_filtro"]}
            </Link>
          )}
        </Reveal>

        {visiblePickupPoints.length === 0 ? (
          <p className="mt-10 font-[family-name:var(--font-form)] text-sm text-metal">
            {category ? t["catalogo.selector.empty_categoria"] : t["catalogo.selector.empty"]}
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {visiblePickupPoints.map((pp, i) => (
              <Reveal key={pp.id} delay={i * 0.1}>
                <Press>
                  <Link
                    href={category ? `/catalogo/${pp.id}?categoria=${category}` : `/catalogo/${pp.id}`}
                    className="block border border-ink-200 bg-ink-200/60 p-6 hover:bg-ink-200"
                  >
                    <h2 className="font-[family-name:var(--font-display)] text-2xl text-paper">
                      {pp.shortName}
                    </h2>
                    <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-metal">
                      {pp.address}
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-form)] text-sm text-emerald">
                      {category ? countByPickupPoint?.get(pp.id) ?? 0 : pp._count.products}{" "}
                      {t["catalogo.selector.count_suffix"]}
                    </p>
                  </Link>
                </Press>
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
