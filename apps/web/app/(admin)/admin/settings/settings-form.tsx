"use client";

import { useActionState, useState } from "react";
import { PhotoUpload } from "../products/photo-upload";
import { saveHomeSettings, type SettingsResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

const DEFAULT_OLIVE = "#1f2a22";

export function SettingsForm({
  initialUrl,
  initialHeadline,
  initialSubtext,
  initialBrandTextColor,
}: {
  initialUrl: string;
  initialHeadline: string;
  initialSubtext: string;
  initialBrandTextColor: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [textColor, setTextColor] = useState(initialBrandTextColor);
  const [state, formAction, pending] = useActionState<SettingsResult | null, FormData>(
    saveHomeSettings,
    null,
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div>
        <label className={label} htmlFor="homeHeadline">
          Título principal del home
        </label>
        <input
          id="homeHeadline"
          name="homeHeadline"
          defaultValue={initialHeadline}
          placeholder="El excedente de la feria, antes de que se pierda."
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="homeSubtext">
          Texto debajo del título
        </label>
        <textarea
          id="homeSubtext"
          name="homeSubtext"
          rows={3}
          defaultValue={initialSubtext}
          placeholder="Cacao, café, banano, piña y más — directo de agricultores de Costa Rica…"
          className={field}
        />
      </div>

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

      <div>
        <label className={label} htmlFor="brandTextColor">
          Color de letra de toda la marca
        </label>
        <div className="flex items-center gap-3">
          <input
            id="brandTextColor"
            name="brandTextColor"
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-10 w-14 shrink-0 border border-cream-200 bg-white p-1"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            placeholder={DEFAULT_OLIVE}
            className={field}
          />
          <button
            type="button"
            onClick={() => setTextColor(DEFAULT_OLIVE)}
            className="shrink-0 whitespace-nowrap font-[family-name:var(--font-form)] text-xs text-stone underline underline-offset-2"
          >
            Restaurar
          </button>
        </div>
        <p
          className="mt-2 border border-cream-200 bg-cream px-3 py-2 font-[family-name:var(--font-form)] text-sm"
          style={{ color: textColor }}
        >
          Así se va a ver el texto en todo el sitio.
        </p>
        <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
          Cambia el color del texto principal en toda la app (catálogo,
          botones, títulos). Es un cambio grande — si el contraste queda
          mal en algún fondo, tocá &quot;Restaurar&quot; para volver al
          olivo original.
        </p>
      </div>

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
