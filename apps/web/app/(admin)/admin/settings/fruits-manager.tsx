"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { PhotoUpload } from "../products/photo-upload";
import { addHomeFruit, removeHomeFruit, type SettingsResult } from "./actions";

type Fruit = { id: string; name: string; imageUrl: string; blurb: string };

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function FruitsManager({ fruits }: { fruits: Fruit[] }) {
  return (
    <div className="max-w-lg">
      {fruits.length > 0 && (
        <ul className="mb-6 divide-y divide-cream-200 border-y border-cream-200">
          {fruits.map((f) => (
            <li key={f.id} className="flex items-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.imageUrl}
                alt=""
                className="size-12 shrink-0 rounded-sm border border-cream-200 object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-display)] text-base text-olive">
                  {f.name}
                </span>
                <span className="block truncate font-[family-name:var(--font-form)] text-xs text-stone">
                  {f.blurb}
                </span>
              </span>
              <RemoveButton id={f.id} />
            </li>
          ))}
        </ul>
      )}

      <AddFruitForm />
    </div>
  );
}

function RemoveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await removeHomeFruit(id); })}
      className="shrink-0 font-[family-name:var(--font-form)] text-sm text-sienna underline underline-offset-4 disabled:opacity-50"
    >
      {pending ? "Quitando…" : "Quitar"}
    </button>
  );
}

function AddFruitForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [state, formAction, pending] = useActionState<SettingsResult | null, FormData>(
    addHomeFruit,
    null,
  );

  useEffect(() => {
    // Limpia los inputs (incluida la imagen) después de agregar una fruta.
    if (state?.ok) {
      setImageUrl("");
      setResetKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      key={resetKey}
      className="flex flex-col gap-3 border border-dashed border-cream-200 p-4"
    >
      <p className="font-[family-name:var(--font-form)] text-sm text-olive">Agregar fruta</p>
      <div>
        <label className={label} htmlFor="fruit-name">
          Nombre
        </label>
        <input id="fruit-name" name="name" required className={field} />
      </div>
      <div>
        <label className={label}>Imagen</label>
        <PhotoUpload onPhotoUrl={setImageUrl} />
        <input
          name="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… (o subí una foto arriba)"
          className={`${field} mt-2`}
        />
      </div>
      <div>
        <label className={label} htmlFor="fruit-blurb">
          Descripción corta
        </label>
        <input id="fruit-blurb" name="blurb" className={field} />
      </div>

      {state && !state.ok && (
        <p className="font-[family-name:var(--font-form)] text-sm text-sienna">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar"}
      </button>
    </form>
  );
}
