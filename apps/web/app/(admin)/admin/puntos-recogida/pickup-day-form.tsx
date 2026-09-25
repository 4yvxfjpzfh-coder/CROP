"use client";

import { useState, useTransition } from "react";
import { PICKUP_DAY_LABELS } from "@/lib/pickup-schedule";
import { updatePickupDay } from "./actions";

export function PickupDayForm({ id, initialDay }: { id: string; initialDay: number }) {
  const [day, setDay] = useState(initialDay);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = day !== initialDay;

  function save() {
    setSaved(false);
    startTransition(async () => {
      const result = await updatePickupDay(id, day);
      if (result.ok) setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={day}
        onChange={(e) => {
          setDay(Number(e.target.value));
          setSaved(false);
        }}
        className="border border-cream-200 bg-white px-2 py-1.5 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive"
      >
        {PICKUP_DAY_LABELS.map((label, i) => (
          <option key={i} value={i}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={pending || !dirty}
        className="bg-olive px-3 py-1.5 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-40"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {saved && !dirty && (
        <span className="font-[family-name:var(--font-form)] text-xs text-gold-text">
          Guardado
        </span>
      )}
    </div>
  );
}
