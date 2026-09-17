import Link from "next/link";
import { prisma } from "@crop/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { SiteBackground } from "@/components/site-background";
import { Press } from "@/components/motion/press";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return {
    title: `${t["nav.catalogo"]} — ${t["brand.name"]}`,
    description: t["catalogo.selector.subtext"],
  };
}

/**
 * Selector de feria: el catálogo 3D ya no es una sola fila con todo
 * mezclado — cada punto de recogida tiene su propia galería
 * (/catalogo/[pickupPointId]), para poder recorrer Santa Ana o Escazú por
 * separado.
 */
export default async function CatalogoPage() {
  const [settings, t, pickupPoints] = await Promise.all([
    getSiteSettings(),
    getSiteTexts(),
    prisma.pickupPoint.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, quantity: { gt: 0 }, catalogPosition: { not: null } },
            },
          },
        },
      },
    }),
  ]);

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
            {t["catalogo.selector.heading"]}
          </h1>
          <p className="mt-3 max-w-lg font-[family-name:var(--font-form)] text-sm leading-relaxed text-metal">
            {t["catalogo.selector.subtext"]}
          </p>
        </Reveal>

        {pickupPoints.length === 0 ? (
          <p className="mt-10 font-[family-name:var(--font-form)] text-sm text-metal">
            {t["catalogo.selector.empty"]}
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {pickupPoints.map((pp, i) => (
              <Reveal key={pp.id} delay={i * 0.1}>
                <Press>
                  <Link
                    href={`/catalogo/${pp.id}`}
                    className="block border border-ink-200 bg-ink-200/60 p-6 hover:bg-ink-200"
                  >
                    <h2 className="font-[family-name:var(--font-display)] text-2xl text-paper">
                      {pp.shortName}
                    </h2>
                    <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-metal">
                      {pp.address}
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-form)] text-sm text-emerald">
                      {pp._count.products} {t["catalogo.selector.count_suffix"]}
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
