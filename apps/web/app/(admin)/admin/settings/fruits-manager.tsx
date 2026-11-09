"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { PhotoUpload } from "../products/photo-upload";
import { addHomeFruit, removeHomeFruit, updateHomeFruit, type SettingsResult } from "./actions";

type Fruit = { id: string; name: string; imageUrl: string; blurb: string };

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function FruitsManager({ fruits }: { fruits: Fruit[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="max-w-lg">
      {fruits.length > 0 && (
        <ul className="mb-6 divide-y divide-cream-200 border-y border-cream-200">
          {fruits.map((f) =>
            editingId === f.id ? (
              <li key={f.id} className="py-3">
                <EditFruitForm fruit={f} onDone={() => setEditingId(null)} />
              </li>
            ) : (
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
                <button
                  type="button"
                  onClick={() => setEditingId(f.id)}
                  className="shrink-0 font-[family-name:var(--font-form)] text-sm text-olive underline underline-offset-4"
                >
                  Editar
                </button>
                <RemoveButton id={f.id} />
              </li>
            ),
          )}
        </ul>
      )}

      <AddFruitForm />
    </div>
  );
}

function EditFruitForm({ fruit, onDone }: { fruit: Fruit; onDone: () => void }) {
  const [imageUrl, setImageUrl] = useState(fruit.imageUrl);
  const [state, formAction, pending] = useActionState<SettingsResult | null, FormData>(
    updateHomeFruit,
    null,
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3 border border-dashed border-cream-200 p-4">
      <input type="hidden" name="id" value={fruit.id} />
      <div>
        <label className={label} htmlFor={`edit-name-${fruit.id}`}>
          Nombre
        </label>
        <input id={`edit-name-${fruit.id}`} name="name" required defaultValue={fruit.name} className={field} />
      </div>
      <div>
        <label className={label}>Imagen</label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="mb-2 size-16 rounded-sm border border-cream-200 object-cover" />
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
        <label className={label} htmlFor={`edit-blurb-${fruit.id}`}>
          Descripción corta
        </label>
        <input id={`edit-blurb-${fruit.id}`} name="blurb" defaultValue={fruit.blurb} className={field} />
      </div>

      {state && !state.ok && (
        <p className="font-[family-name:var(--font-form)] text-sm text-sienna">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border border-cream-200 px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive"
        >
          Cancelar
        </button>
      </div>
    </form>
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
