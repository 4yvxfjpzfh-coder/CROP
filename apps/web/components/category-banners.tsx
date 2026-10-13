import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/**
 * Banners grandes de sección en el inicio, al estilo Wix: una imagen grande
 * por categoría, que lleva a /catalogo filtrado en esa sección. De ahí en
 * adelante es el selector de feria de siempre (cada feria filtrada muestra
 * cuántos productos de esa sección tiene) -- no hay un "carrito" cruzado
 * entre ferias, así que esto es una guía para elegir feria, no un catálogo
 * aparte.
 */
export function CategoryBanners({ heading, subtext, lang }: { heading: string; subtext: string; lang: string }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-14">
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-paper">{heading}</h2>
        <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-metal">{subtext}</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/catalogo?categoria=${c.id}`}
            className="group overflow-hidden rounded-2xl border border-ink-200 bg-ink-200/40 shadow-sm transition hover:border-emerald/60 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image}
              alt=""
              className="aspect-square w-full object-cover transition group-hover:scale-105"
            />
            <p className="px-3 py-2.5 text-center font-[family-name:var(--font-display)] text-sm text-paper">
              {lang === "en" ? c.labelEn : c.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
