"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type FarmerPickupPoint, type FarmerProduct } from "./types";
import { productCode } from "@/lib/units";
import { PickupPointField } from "@/app/(admin)/admin/products/pickup-point-field";
import { PhotoUpload } from "@/app/(admin)/admin/products/photo-upload";
import { PhotoEditorLauncher } from "@/app/(admin)/admin/products/photo-editor-launcher";
import {
  createOwnProduct,
  updateOwnProduct,
  deleteOwnProduct,
  type FarmerProductResult,
} from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";
const label = "mb-1 block font-[family-name:var(--font-form)] text-sm text-stone";

export function FarmerProductForm({
  product,
  pickupPoints,
  onCreated,
  texts: t,
}: {
  product: FarmerProduct | null;
  pickupPoints: FarmerPickupPoint[];
  onCreated?: () => void;
  texts: Record<string, string>;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [state, formAction, pending] = useActionState<FarmerProductResult | null, FormData>(
    isEdit ? updateOwnProduct : createOwnProduct,
    null,
  );

  const [pickupPointId, setPickupPointId] = useState<string | null>(
    product?.pickupPointId ?? null,
  );
  const [photoUrl, setPhotoUrl] = useState<string>(product?.photoUrl ?? "");
  const [unit, setUnit] = useState<"UNIDAD" | "KG">(product?.unit ?? "UNIDAD");

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      // Solo al crear: limpia el formulario para el próximo producto. Al
      // editar, se queda mostrando lo que se acaba de guardar.
      if (!isEdit) onCreated?.();
    }
    // "onCreated" es una función inline nueva en cada render del padre
    // (workspace.tsx no la memoiza) e "isEdit" no cambia sin un remount (la
    // key del form usa product?.id). Si se incluyen acá, cada
    // router.refresh() dispara el efecto otra vez aunque "state" no haya
    // cambiado -> bucle infinito de refresh al editar un producto. El
    // efecto solo debe correr cuando "state" cambia de verdad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  return (
    <div>
      <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl text-olive">
        {isEdit ? t["admin.products.form_editar"] : t["admin.products.form_nuevo"]}
      </h2>
      {isEdit && product?.farmerSeq && (
        <p className="mb-1 font-[family-name:var(--font-form)] text-xs text-stone">
          {t["admin.products.form_codigo_prefix"]} {productCode({
            name: product.name,
            farmerName: product.providerName,
            farmerSeq: product.farmerSeq,
          }) ?? `${product.name} #${product.farmerSeq}`}
        </p>
      )}
      <p className="mb-4 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["agricultor.products.form_auto_publica"]}
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        {isEdit && <input type="hidden" name="id" value={product!.id} />}

        <div>
          <label className={label} htmlFor="name">
            {t["admin.products.form_nombre"]}
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
            {t["admin.products.form_descripcion"]}
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
          <label className={label}>{t["admin.products.form_foto"]}</label>
          <PhotoUpload onPhotoUrl={setPhotoUrl} texts={t} />
          <div className="mt-3 flex flex-col gap-2">
            <label className={label} htmlFor="photoUrl">
              {t["admin.products.form_pegar_url"]}
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
              texts={t}
            />
          )}
        </div>

        <div>
          <label className={label} htmlFor="unit">
            {t["admin.products.form_se_vende_por"]}
          </label>
          <select
            id="unit"
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as "UNIDAD" | "KG")}
            className={field}
          >
            <option value="UNIDAD">{t["admin.products.form_unidades"]}</option>
            <option value="KG">{t["admin.products.form_kilos"]}</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="quantity">
              {t["admin.products.form_cantidad_prefix"]} {unit === "KG" ? "(kg)" : "(unidades)"}
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step={unit === "KG" ? 0.25 : 1}
              required
              defaultValue={product?.quantity ?? 0}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="discountPriceCents">
              {t["admin.products.form_excedente_prefix"]} (¢{unit === "KG" ? "/kg" : ""})
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
          texts={t}
        />

        <label className="flex items-center gap-2 font-[family-name:var(--font-form)] text-sm text-olive">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="size-4 accent-olive"
          />
          {t["admin.products.form_visible_clientes"]}
        </label>

        {state && !state.ok && (
          <p className="border-l-2 border-sienna bg-sienna/10 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-sienna">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="border-l-2 border-gold bg-gold/10 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive">
            {t["admin.products.form_guardado"]}
          </p>
        )}

        <div className="mt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-olive px-5 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
          >
            {pending
              ? t["admin.products.form_guardando"]
              : isEdit
                ? t["admin.products.form_guardar_cambios"]
                : t["admin.products.form_publicar_producto"]}
          </button>
        </div>
      </form>

      {/* Fuera del <form> de arriba a propósito: DeleteButton tiene su propio
          <form> (para el botón "Sí, eliminar"), y un <form> anidado dentro de
          otro es HTML inválido — el navegador lo rompe y el submit deja de
          ir a la acción correcta. */}
      {isEdit && (
        <div className="mt-3 flex items-center gap-3">
          <DeleteButton productId={product!.id} onDone={() => router.refresh()} texts={t} />
        </div>
      )}
    </div>
  );
}

function DeleteButton({
  productId,
  onDone,
  texts: t,
}: {
  productId: string;
  onDone: () => void;
  texts: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<FarmerProductResult | null, FormData>(
    deleteOwnProduct,
    null,
  );
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-[family-name:var(--font-form)] text-sm text-sienna underline underline-offset-4"
      >
        {t["admin.products.form_eliminar"]}
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={productId} />
      <span className="font-[family-name:var(--font-form)] text-sm text-sienna">{t["admin.products.form_seguro"]}</span>
      <button
        type="submit"
        disabled={pending}
        className="bg-sienna px-3 py-1.5 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
      >
        {t["admin.products.form_si_eliminar"]}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-[family-name:var(--font-form)] text-sm text-stone"
      >
        {t["admin.products.form_cancelar"]}
      </button>
    </form>
  );
}
