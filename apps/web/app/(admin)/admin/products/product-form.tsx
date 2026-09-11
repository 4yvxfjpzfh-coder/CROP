"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { type AdminPickupPoint, type AdminProduct } from "./types";
import { PickupPointField } from "./pickup-point-field";
import { PhotoEditorLauncher } from "./photo-editor-launcher";
import { PhotoUpload } from "./photo-upload";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductActionResult,
} from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function ProductForm({
  product,
  pickupPoints,
}: {
  product: AdminProduct | null;
  pickupPoints: AdminPickupPoint[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [state, formAction, pending] = useActionState<ProductActionResult | null, FormData>(
    isEdit ? updateProduct : createProduct,
    null,
  );

  const [pickupPointId, setPickupPointId] = useState<string | null>(
    product?.pickupPointId ?? null,
  );
  const [photoUrl, setPhotoUrl] = useState<string>(product?.photoUrl ?? "");

  if (state?.ok) {
    // Refresca la lista del server component tras crear/editar.
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-5 font-[family-name:var(--font-display)] text-2xl text-olive">
        {isEdit ? "Editar producto" : "Nuevo producto"}
      </h2>

      <form action={formAction} className="flex flex-col gap-4">
        {isEdit && <input type="hidden" name="id" value={product!.id} />}

        <div>
          <label className={label} htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className={`${field} font-[family-name:var(--font-display)] text-base`}
          />
        </div>

        <div>
          <label className={label} htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className={field}
          />
        </div>

        <div>
          <label className={label}>Foto</label>
          <PhotoUpload onPhotoUrl={setPhotoUrl} />
          <div className="mt-3 flex flex-col gap-2">
            <label className={label} htmlFor="photoUrl">
              O pegá una URL
            </label>
            <input
              id="photoUrl"
              name="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              className={field}
            />
          </div>
          {photoUrl && (
            <PhotoEditorLauncher
              productName={product?.name ?? "Producto"}
              sourceUrl={photoUrl}
              onSaved={(url) => setPhotoUrl(url)}
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={label} htmlFor="quantity">
              Cantidad
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              required
              defaultValue={product?.quantity ?? 0}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="originalPriceCents">
              Ref. (¢)
            </label>
            <input
              id="originalPriceCents"
              name="originalPriceCents"
              type="number"
              min={0}
              required
              defaultValue={product?.originalPriceCents ?? 0}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="discountPriceCents">
              Excedente (¢)
            </label>
            <input
              id="discountPriceCents"
              name="discountPriceCents"
              type="number"
              min={0}
              required
              defaultValue={product?.discountPriceCents ?? 0}
              className={field}
            />
          </div>
        </div>

        <PickupPointField
          pickupPoints={pickupPoints}
          value={pickupPointId}
          onChange={setPickupPointId}
        />

        <label className="flex items-center gap-2 font-[family-name:var(--font-form)] text-sm text-olive">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="size-4 accent-olive"
          />
          Visible para clientes
        </label>

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

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-olive px-5 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
          >
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Publicar producto"}
          </button>

          {isEdit && (
            <DeleteButton productId={product!.id} onDone={() => router.refresh()} />
          )}
        </div>
      </form>
    </div>
  );
}

function DeleteButton({
  productId,
  onDone,
}: {
  productId: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ProductActionResult | null, FormData>(
    deleteProduct,
    null,
  );
  const [confirming, setConfirming] = useState(false);

  if (state?.ok) onDone();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-[family-name:var(--font-form)] text-sm text-sienna underline underline-offset-4"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={productId} />
      <span className="font-[family-name:var(--font-form)] text-sm text-sienna">
        ¿Seguro?
      </span>
      <button
        type="submit"
        disabled={pending}
        className="bg-sienna px-3 py-1.5 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
      >
        Sí, eliminar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-[family-name:var(--font-form)] text-sm text-stone"
      >
        Cancelar
      </button>
    </form>
  );
}
