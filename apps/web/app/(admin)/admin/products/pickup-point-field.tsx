"use client";

import { useState } from "react";
import {
  type AdminPickupPoint,
  distanceKm,
  SAN_JOSE_CENTRO,
} from "./types";

/**
 * Selector de punto de recogida. No es un dropdown: muestra las dos ferias
 * como opciones tangibles, cada una con su dirección y un badge de distancia
 * al centro de San José, para que el admin escoja el lugar como lo haría
 * pensando en el recorrido real de la feria.
 */
export function PickupPointField({
  pickupPoints,
  value,
  onChange,
  name = "pickupPointId",
  texts: t,
}: {
  pickupPoints: AdminPickupPoint[];
  value: string | null;
  onChange: (id: string) => void;
  name?: string;
  texts: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string | null>(value);

  function pick(id: string) {
    setSelected(id);
    onChange(id);
  }

  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-2 font-[family-name:var(--font-form)] text-sm text-stone">
        {t["admin.photo.punto_recogida"]}
      </legend>
      <input type="hidden" name={name} value={selected ?? ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        {pickupPoints.map((pp) => {
          const active = selected === pp.id;
          const km = distanceKm(pp, SAN_JOSE_CENTRO);
          return (
            <button
              type="button"
              key={pp.id}
              onClick={() => pick(pp.id)}
              aria-pressed={active}
              className={
                active
                  ? "flex flex-col gap-2 border-2 border-olive bg-cream-200 px-4 py-3 text-left"
                  : "flex flex-col gap-2 border border-cream-200 bg-cream px-4 py-3 text-left hover:border-stone"
              }
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-[family-name:var(--font-display)] text-lg leading-tight text-olive">
                  {pp.shortName}
                </span>
                {km != null && (
                  <span className="shrink-0 bg-olive px-2 py-0.5 text-[11px] font-medium text-cream">
                    {km} {t["admin.photo.km_del_centro_suffix"]}
                  </span>
                )}
              </span>
              <span className="font-[family-name:var(--font-form)] text-xs leading-snug text-stone">
                {pp.name}
              </span>
              <span className="font-[family-name:var(--font-form)] text-xs leading-snug text-stone">
                {pp.address}
              </span>
            </button>
          );
        })}
      </div>

      {pickupPoints.length === 0 && (
        <p className="mt-2 text-sm text-sienna">
          No hay puntos de recogida. Corré el seed de PickupPoint.
        </p>
      )}
    </fieldset>
  );
}
