"use client";

import { useActionState, useState } from "react";
import { PhotoUpload } from "../products/photo-upload";
import { saveHomeSettings, type SettingsResult } from "./actions";
import { MAX_PICKUP_WINDOW_HOURS } from "@/lib/pickup-window";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function SettingsForm({
  initialUrl,
  initialHeadline,
  initialSubtext,
  initialPickupHours,
}: {
  initialUrl: string;
  initialHeadline: string;
  initialSubtext: string;
  initialPickupHours: number;
}) {
  const [url, setUrl] = useState(initialUrl);
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
        <label className={label} htmlFor="pickupWindowHours">
          Horas para recoger un apartado
        </label>
        <input
          id="pickupWindowHours"
          name="pickupWindowHours"
          type="number"
          min={1}
          max={MAX_PICKUP_WINDOW_HOURS}
          defaultValue={initialPickupHours}
          className={field}
        />
        <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
          Cuando alguien aparta un producto, tiene esta cantidad de horas
          desde ese momento para recogerlo antes de que se libere solo.
          Máximo {MAX_PICKUP_WINDOW_HOURS} horas.
        </p>
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
