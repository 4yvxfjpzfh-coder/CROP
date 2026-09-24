"use client";

import { useMemo, useState } from "react";
import { type FarmerPickupPoint, type FarmerProduct, colones } from "./types";
import { formatQuantity, formatUnitPrice } from "@/lib/units";
import { FarmerProductForm } from "./form";

export function FarmerProductsWorkspace({
  products,
  pickupPoints,
  texts: t,
}: {
  products: FarmerProduct[];
  pickupPoints: FarmerPickupPoint[];
  texts: Record<string, string>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Fuerza que el formulario se remonte en blanco después de publicar uno
  // nuevo: mientras selectedId siga en null, la key de abajo seguiría siendo
  // "new" y el formulario no se reiniciaría solo (quedaría con los mismos
  // valores ya enviados, invitando a un doble envío accidental).
  const [resetKey, setResetKey] = useState(0);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <section>
        <header className="mb-6 flex items-end justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
            {t["agricultor.products.heading"]}
          </h1>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={
              selectedId === null
                ? "border-b-2 border-gold pb-1 font-[family-name:var(--font-form)] text-sm text-olive"
                : "border-b-2 border-transparent pb-1 font-[family-name:var(--font-form)] text-sm text-stone hover:text-olive"
            }
          >
            {t["agricultor.products.publicar_nuevo"]}
          </button>
        </header>

        <details className="mb-6 border border-cream-200 bg-cream-200/30 px-4 py-3">
          <summary className="cursor-pointer font-[family-name:var(--font-form)] text-sm font-medium text-olive">
            {t["agricultor.products.guia_titulo"]}
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-[family-name:var(--font-form)] text-sm text-stone">
            {t["agricultor.products.guia_body"].split("\n").filter(Boolean).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </details>

        {products.length === 0 ? (
          <p className="font-[family-name:var(--font-form)] text-sm text-stone">
            {t["agricultor.products.empty"]}
          </p>
        ) : (
          <ul className="divide-y divide-cream-200 border-y border-cream-200">
            {products.map((p) => {
              const active = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={
                      "flex w-full items-center gap-4 py-4 pl-3 text-left " +
                      (active
                        ? "border-l-2 border-olive bg-cream-200/60"
                        : "border-l-2 border-transparent hover:bg-cream-200/30")
                    }
                  >
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photoUrl}
                        alt=""
                        className="size-12 shrink-0 rounded-sm border border-cream-200 object-cover"
                      />
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-dashed border-cream-200 font-[family-name:var(--font-form)] text-[10px] text-stone">
                        {t["admin.products.sin_foto"]}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="font-[family-name:var(--font-display)] text-lg text-olive">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block font-[family-name:var(--font-form)] text-xs text-stone">
                        {formatQuantity(p.quantity, p.unit)} {t["admin.products.disponibles_suffix"]}
                        {p.pickupShortName ? ` · ${p.pickupShortName}` : ` · ${t["admin.products.sin_punto_recogida"]}`}
                        {!p.isActive && ` · ${t["admin.products.oculto"]}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-[family-name:var(--font-display)] text-base text-gold-text">
                        {formatUnitPrice(colones(p.discountPriceCents), p.unit)}
                      </span>
                      {p.discountPriceCents < p.originalPriceCents && (
                        <span className="mt-0.5 block font-[family-name:var(--font-form)] text-[11px] text-sienna">
                          {t["admin.products.antes_prefix"]} {colones(p.originalPriceCents)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside className="lg:border-l lg:border-cream-200 lg:pl-10">
        <FarmerProductForm
          key={selected?.id ?? `new-${resetKey}`}
          product={selected}
          pickupPoints={pickupPoints}
          onCreated={() => setResetKey((k) => k + 1)}
          texts={t}
        />
      </aside>
    </div>
  );
}
