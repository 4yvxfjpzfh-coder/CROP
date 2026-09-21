"use client";

import { useActionState, useEffect, useRef } from "react";
import { makeFarmer, type FarmerActionResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function MakeFarmerForm() {
  const [state, formAction, pending] = useActionState<FarmerActionResult | null, FormData>(
    makeFarmer,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-md">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block font-[family-name:var(--font-form)] text-sm text-stone" htmlFor="email">
            Correo de la cuenta que ya inició sesión
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="agricultor@ejemplo.com"
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
        >
          {pending ? "Asignando…" : "Hacer agricultor"}
        </button>
      </div>
      {state && !state.ok && (
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm text-sienna">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm text-olive">
          Listo, ya es agricultor.
        </p>
      )}
    </form>
  );
}
