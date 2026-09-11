"use client";

import { useActionState } from "react";
import { reserveProduct, type ReserveResult } from "./actions";

export function ReserveButton({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<ReserveResult | null, FormData>(
    reserveProduct,
    null,
  );

  if (state?.ok) {
    return (
      <p className="mt-3 border-l-2 border-[#C89B3C] bg-[#C89B3C]/10 px-3 py-2 text-sm text-[#1F2A22]">
        Apartado listo. Recogé antes del{" "}
        {new Date(state.pickupBy).toLocaleString("es-CR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        {" · "}
        <a href="/mis-apartados" className="underline underline-offset-2">
          Mis apartados
        </a>
      </p>
    );
  }

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={1} />
      <button
        type="submit"
        disabled={pending}
        className="bg-[#1F2A22] px-4 py-2 text-sm text-[#F6F1E7] disabled:opacity-60"
      >
        {pending ? "Apartando…" : "Apartar 1 unidad"}
      </button>
      {state && !state.ok && (
        <span className="ml-3 text-sm text-[#B5562B]">{state.error}</span>
      )}
    </form>
  );
}
