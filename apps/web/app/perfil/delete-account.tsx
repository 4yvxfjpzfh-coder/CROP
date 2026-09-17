"use client";

import { useActionState, useState } from "react";
import { deleteMyAccount, type DeleteAccountResult } from "./actions";

export function DeleteAccount({ texts }: { texts: Record<string, string> }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<DeleteAccountResult | null, FormData>(
    () => deleteMyAccount(null),
    null,
  );

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-base font-medium text-red-900">{texts["cuenta.delete.heading"]}</h2>
      <p className="mt-1 text-sm leading-relaxed text-red-800">
        {texts["cuenta.delete.warning"]}
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {texts["cuenta.delete.heading"]}
        </button>
      ) : (
        <form action={action} className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? texts["cuenta.delete.button_pending"] : texts["cuenta.delete.button_confirm"]}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-sm text-red-700"
          >
            {texts["cuenta.delete.button_cancel"]}
          </button>
        </form>
      )}

      {state && state.error && (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      )}
    </div>
  );
}
