"use client";

import { useState, useTransition } from "react";
import { updateTableNumber } from "./actions";

export function TableNumberField({
  userId,
  initialValue,
  texts: t,
}: {
  userId: string;
  initialValue: string;
  texts: Record<string, string>;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = value !== initialValue;

  function save() {
    setSaved(false);
    startTransition(async () => {
      const result = await updateTableNumber(userId, value);
      if (result.ok) setSaved(true);
    });
  }

  return (
    <span className="flex items-center gap-1.5">
      <label className="font-[family-name:var(--font-form)] text-xs text-stone">
        {t["admin.agricultores.mesa_label"]}
      </label>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder={t["admin.agricultores.mesa_placeholder"]}
        className="w-16 border border-cream-200 bg-white px-1.5 py-1 font-[family-name:var(--font-form)] text-xs text-olive outline-none focus:border-olive"
      />
      <button
        type="button"
        onClick={save}
        disabled={pending || !dirty}
        className="bg-olive px-2 py-1 font-[family-name:var(--font-form)] text-xs text-cream disabled:opacity-40"
      >
        {pending ? "…" : t["admin.agricultores.mesa_guardar"]}
      </button>
      {saved && !dirty && (
        <span className="font-[family-name:var(--font-form)] text-xs text-gold-text">✓</span>
      )}
    </span>
  );
}
