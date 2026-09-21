"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { placeOrder, type PlaceOrderResult } from "./actions";
import { type CatalogProduct, MAX_QUANTITY_PER_ITEM, colones } from "./catalog-types";
import { formatUnitPrice, QUANTITY_STEP, type ProductUnit } from "@/lib/units";
import { formatPickupDeadline } from "@/lib/format";
import { schedulePickupReminder } from "@/lib/native";
import { SiteBackground } from "@/components/site-background";

function unitSuffix(unit: ProductUnit) {
  return unit === "KG" ? "kg" : "u";
}

function ProductCard({
  product,
  quantityInCart,
  onChange,
  texts,
}: {
  product: CatalogProduct;
  quantityInCart: number;
  onChange: (quantity: number) => void;
  texts: Record<string, string>;
}) {
  const discounted = product.discountPriceCents < product.originalPriceCents;
  const step = QUANTITY_STEP[product.unit];
  const max = Math.min(MAX_QUANTITY_PER_ITEM, product.quantity);
  const round = (n: number) => Math.round(n * 100) / 100;

  return (
    <div className="flex flex-col border border-cream-200 bg-white">
      <div className="aspect-[3/2] w-full overflow-hidden bg-olive/5">
        {product.photoUrl ? (
          // Fotos con URL arbitraria (pegadas a mano por admin/agricultor): un
          // <img> normal evita tener que declarar cada dominio para next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.photoUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-olive px-2 text-center">
            <span className="font-[family-name:var(--font-display)] text-base text-cream">
              {product.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-[family-name:var(--font-display)] text-base text-olive">
          {product.name}
        </p>
        {product.code && (
          <p className="font-[family-name:var(--font-form)] text-[11px] text-stone">
            {product.code}
          </p>
        )}
        <p className="font-[family-name:var(--font-form)] text-sm">
          <span className={discounted ? "text-sienna" : "text-gold-text"}>
            {formatUnitPrice(colones(product.discountPriceCents), product.unit)}
          </span>
          {discounted && (
            <span className="ml-2 text-xs text-stone line-through">
              {colones(product.originalPriceCents)}
            </span>
          )}
        </p>
        <p className="font-[family-name:var(--font-form)] text-xs text-stone">
          {product.quantity} {unitSuffix(product.unit)} {texts["catalogo.gallery.disponibles_suffix"]}
          {product.pickupShortName ? ` · ${product.pickupShortName}` : ""}
        </p>
        {product.providerName && (
          <p className="font-[family-name:var(--font-form)] text-xs text-stone">
            {texts["catalogo.gallery.cultivado_por_prefix"]} {product.providerName}
          </p>
        )}
        {product.ripenessNote && (
          <span className="w-fit border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] text-gold-text">
            {product.ripenessNote}
          </span>
        )}

        <div className="mt-auto pt-2">
          {quantityInCart <= 0 ? (
            <button
              type="button"
              onClick={() => onChange(Math.min(max, step))}
              disabled={max <= 0}
              className="w-full bg-olive px-3 py-1.5 font-[family-name:var(--font-form)] text-xs text-cream disabled:opacity-40"
            >
              {texts["catalogo.cart.add"]}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onChange(Math.max(0, round(quantityInCart - step)))}
                className="size-7 border border-cream-200 text-olive"
                aria-label="Restar"
              >
                −
              </button>
              <span className="font-[family-name:var(--font-form)] text-sm text-olive">
                {quantityInCart} {unitSuffix(product.unit)}
              </span>
              <button
                type="button"
                onClick={() => onChange(Math.min(max, round(quantityInCart + step)))}
                disabled={quantityInCart >= max}
                className="size-7 border border-cream-200 text-olive disabled:opacity-30"
                aria-label="Sumar"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogGrid({
  products,
  backgroundUrl,
  feriaName,
  backHref = "/",
  texts,
}: {
  products: CatalogProduct[];
  backgroundUrl: string | null;
  feriaName?: string;
  backHref?: string;
  texts: Record<string, string>;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [state, formAction, pending] = useActionState<PlaceOrderResult | null, FormData>(
    placeOrder,
    null,
  );

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  useEffect(() => {
    if (state?.ok) {
      schedulePickupReminder(state.orderId, state.pickupBy);
      setCart({});
    }
  }, [state]);

  function setQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  const cartEntries = Object.entries(cart);
  const totalCents = cartEntries.reduce((sum, [id, qty]) => {
    const p = productMap.get(id);
    return p ? sum + qty * p.discountPriceCents : sum;
  }, 0);
  const itemsJson = JSON.stringify(
    cartEntries.map(([productId, quantity]) => ({ productId, quantity })),
  );

  return (
    <div className="relative min-h-dvh w-full pb-28">
      {backgroundUrl && <SiteBackground url={backgroundUrl} />}

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href={backHref}
          className={
            "inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-xl uppercase hover:opacity-80 " +
            (backgroundUrl ? "text-cream" : "text-olive")
          }
        >
          <span aria-hidden>←</span> {feriaName ?? texts["brand.name"]}
        </Link>
      </header>

      {state?.ok && (
        <div className="mx-auto max-w-6xl px-6">
          <p className="border-l-2 border-gold bg-gold/10 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
            {texts["catalogo.cart.success_prefix"]} {formatPickupDeadline(state.pickupBy)}
            {" · "}
            <Link href="/mis-apartados" className="underline underline-offset-2">
              {texts["nav.mis_apartados"]}
            </Link>
          </p>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            quantityInCart={cart[p.id] ?? 0}
            onChange={(q) => setQuantity(p.id, q)}
            texts={texts}
          />
        ))}
      </main>

      {cartEntries.length > 0 && (
        <form
          action={formAction}
          // z-[60]: por encima del aviso de cookies (z-50, fijo abajo en toda
          // la tienda) — si no, el aviso tapa el botón "Hacer pedido" hasta
          // que alguien lo cierra, y el carrito queda imposible de enviar.
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-cream-200 bg-cream/95 px-6 py-4 backdrop-blur"
        >
          <input type="hidden" name="items" value={itemsJson} />
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <p className="font-[family-name:var(--font-form)] text-sm text-olive">
              {texts["catalogo.cart.total_prefix"]}{" "}
              <span className="font-semibold text-gold-text">{colones(totalCents)}</span>
            </p>
            <button
              type="submit"
              disabled={pending}
              className="bg-olive px-6 py-2.5 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
            >
              {pending ? texts["catalogo.cart.pending"] : texts["catalogo.cart.place_order"]}
            </button>
          </div>
          {state && !state.ok && (
            <p className="mx-auto mt-2 max-w-6xl font-[family-name:var(--font-form)] text-sm text-sienna">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
