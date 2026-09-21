"use client";

import { useActionState, useEffect } from "react";
import { reserveProduct, type ReserveResult } from "./actions";
import { schedulePickupReminder } from "@/lib/native";

export function ReserveButton({
  productId,
  texts,
}: {
  productId: string;
  texts: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<ReserveResult | null, FormData>(
    reserveProduct,
    null,
  );

  useEffect(() => {
    if (state?.ok) schedulePickupReminder(state.orderId, state.pickupBy);
  }, [state]);

  if (state?.ok) {
    return (
      <p className="mt-3 border-l-2 border-[#C89B3C] bg-[#C89B3C]/10 px-3 py-2 text-sm text-[#1F2A22]">
        {texts["catalogo.reserve.success_prefix"]}{" "}
        {new Date(state.pickupBy).toLocaleString("es-CR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        {" · "}
        <a href="/mis-apartados" className="underline underline-offset-2">
          {texts["nav.mis_apartados"]}
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
        {pending ? texts["catalogo.reserve.pending"] : texts["catalogo.reserve.idle"]}
      </button>
      {state && !state.ok && (
        <span className="ml-3 text-sm text-[#B5562B]">{state.error}</span>
      )}
    </form>
  );
}
