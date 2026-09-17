"use client";

import { useState, useTransition } from "react";
import { cancelOrder } from "./actions";

export function CancelButton({
  orderId,
  texts,
}: {
  orderId: string;
  texts: Record<string, string>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
      >
        {texts["apartados.cancel.button_initial"]}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="text-neutral-600">{texts["apartados.cancel.confirm_text"]}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelOrder(orderId);
            if (!result.ok) setError(result.error ?? texts["apartados.cancel.error_generic"]);
          })
        }
        className="text-neutral-900 underline underline-offset-2 disabled:opacity-50"
      >
        {pending ? texts["apartados.cancel.button_pending"] : texts["apartados.cancel.button_confirm"]}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-neutral-400">
        {texts["apartados.cancel.button_no"]}
      </button>
      {error && <span className="text-red-600">{error}</span>}
    </span>
  );
}
