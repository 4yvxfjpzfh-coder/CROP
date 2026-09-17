"use client";

import { useActionState } from "react";
import type { SiteTextGroup } from "@/lib/site-text-defaults";
import { saveSiteTexts, type SiteTextResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function TextosForm({
  groups,
  values,
}: {
  groups: SiteTextGroup[];
  values: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<SiteTextResult | null, FormData>(
    saveSiteTexts,
    null,
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {groups.map((group) => (
        <details key={group.title} className="border border-cream-200 bg-white">
          <summary className="cursor-pointer select-none px-4 py-3 font-[family-name:var(--font-display)] text-base text-olive">
            {group.title}
          </summary>
          <div className="flex flex-col gap-4 border-t border-cream-200 p-4">
            {group.fields.map((f) => (
              <div key={f.key}>
                <label className={label} htmlFor={f.key}>
                  {f.label}
                </label>
                {f.multiline ? (
                  <textarea
                    id={f.key}
                    name={f.key}
                    rows={f.default.length > 200 ? 8 : 3}
                    defaultValue={values[f.key] ?? f.default}
                    placeholder={f.default}
                    className={field}
                  />
                ) : (
                  <input
                    id={f.key}
                    name={f.key}
                    defaultValue={values[f.key] ?? f.default}
                    placeholder={f.default}
                    className={field}
                  />
                )}
                {f.hint && (
                  <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
                    {f.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      ))}

      {state && !state.ok && (
        <p className="border-l-2 border-sienna bg-sienna/10 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-sienna">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="border-l-2 border-gold bg-gold/10 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive">
          Guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="sticky bottom-4 self-start bg-olive px-5 py-2 font-[family-name:var(--font-form)] text-sm text-cream shadow-lg disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar todo"}
      </button>
    </form>
  );
}
