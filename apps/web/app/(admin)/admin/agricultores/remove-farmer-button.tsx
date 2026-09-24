"use client";

import { useState, useTransition } from "react";
import { removeFarmerRole } from "./actions";

export function RemoveFarmerButton({
  userId,
  texts: t,
}: {
  userId: string;
  texts: Record<string, string>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-[family-name:var(--font-form)] text-sm text-sienna underline underline-offset-4"
      >
        {t["admin.agricultores.quitar_rol"]}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="font-[family-name:var(--font-form)] text-sm text-stone">{t["admin.agricultores.seguro"]}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await removeFarmerRole(userId);
            if (!result.ok) setError(result.error ?? "No se pudo quitar el rol");
            else setConfirming(false);
          })
        }
        className="bg-sienna px-3 py-1.5 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
      >
        {t["admin.agricultores.si_quitar"]}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-[family-name:var(--font-form)] text-sm text-stone"
      >
        {t["admin.agricultores.cancelar"]}
      </button>
      {error && <span className="text-sm text-sienna">{error}</span>}
    </span>
  );
}
