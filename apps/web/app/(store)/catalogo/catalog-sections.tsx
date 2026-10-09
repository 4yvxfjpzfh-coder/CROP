"use client";

import { CATEGORIES, type CategoryId } from "@/lib/categories";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** ¿El producto coincide con lo que se escribió en el buscador? */
export function matchesSearch(
  p: { name: string; description: string | null; providerName: string | null; code: string | null },
  query: string,
): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize([p.name, p.description, p.providerName, p.code].filter(Boolean).join(" "));
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function categoryLabel(id: CategoryId, lang: string) {
  const c = CATEGORIES.find((c) => c.id === id)!;
  return lang === "en" ? c.labelEn : c.label;
}

/** Buscador + tarjetas de sección, cada una con su ilustración. */
export function CatalogFilters({
  query,
  onQuery,
  selected,
  onSelect,
  counts,
  lang,
}: {
  query: string;
  onQuery: (q: string) => void;
  selected: CategoryId | null;
  onSelect: (c: CategoryId | null) => void;
  counts: Partial<Record<CategoryId, number>>;
  lang: string;
}) {
  const en = lang === "en";
  const visible = CATEGORIES.filter((c) => (counts[c.id] ?? 0) > 0);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={en ? "Search: cheese, strawberries, bread…" : "Buscar: queso, fresas, pan…"}
          aria-label={en ? "Search products" : "Buscar productos"}
          className="w-full rounded-full border border-cream-200 bg-white py-3 pl-11 pr-4 font-[family-name:var(--font-form)] text-base text-olive shadow-sm outline-none focus:border-olive"
        />
      </div>

      {visible.length > 1 && (
        <div className="-mx-6 mt-5 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          <SectionTile
            label={en ? "All" : "Todo"}
            image="/categorias/todo.svg"
            count={Object.values(counts).reduce((a, b) => a + (b ?? 0), 0)}
            active={selected === null}
            onClick={() => onSelect(null)}
          />
          {visible.map((c) => (
            <SectionTile
              key={c.id}
              label={en ? c.labelEn : c.label}
              image={c.image}
              count={counts[c.id] ?? 0}
              active={selected === c.id}
              onClick={() => onSelect(selected === c.id ? null : c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTile({
  label,
  image,
  count,
  active,
  onClick,
}: {
  label: string;
  image: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "group w-28 shrink-0 overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition sm:w-auto " +
        (active ? "border-olive ring-2 ring-olive/20" : "border-transparent hover:border-cream-200")
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="aspect-square w-full object-cover transition group-hover:scale-105" />
      <div className="px-3 py-2">
        <p className="font-[family-name:var(--font-display)] text-sm text-olive">{label}</p>
        <p className="font-[family-name:var(--font-form)] text-[11px] text-stone">{count}</p>
      </div>
    </button>
  );
}
