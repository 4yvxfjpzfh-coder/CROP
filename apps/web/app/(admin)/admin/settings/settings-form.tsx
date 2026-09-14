"use client";

import { useActionState, useState } from "react";
import { PhotoUpload } from "../products/photo-upload";
import { saveHomeBackground, type SettingsResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function SettingsForm({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [state, formAction, pending] = useActionState<SettingsResult | null, FormData>(
    saveHomeBackground,
    null,
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div>
        <label className={label}>Foto de fondo (inicio y catálogo)</label>
        <PhotoUpload onPhotoUrl={setUrl} />
        <div className="mt-3 flex flex-col gap-2">
          <label className={label} htmlFor="homeBackgroundUrl">
            O pegá una URL
          </label>
          <input
            id="homeBackgroundUrl"
            name="homeBackgroundUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className={field}
          />
        </div>
        <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
          Dejalo vacío para volver al patrón de hojas por defecto.
        </p>
      </div>

      {url && (
        <div className="border border-cream-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Vista previa" className="aspect-video w-full object-cover" />
        </div>
      )}

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
        className="self-start bg-olive px-5 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
