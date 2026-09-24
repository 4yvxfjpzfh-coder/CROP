"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function ForgotPasswordClient({ texts: t }: { texts: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<ForgotPasswordResult | null, FormData>(
    requestPasswordReset,
    null,
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 bg-cream px-6 py-16">
      <Link
        href="/signin"
        className="-mb-2 inline-block w-fit bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream hover:opacity-90"
      >
        {t["olvide.volver_signin"]}
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          {t["olvide.heading"]}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
          {t["olvide.subtext"]}
        </p>
      </div>

      {state?.ok ? (
        <p className="border-l-2 border-gold bg-gold/10 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
          {t["olvide.success"]}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={t["signin.email_placeholder"]}
            className={field}
          />
          {state && !state.ok && (
            <p className="font-[family-name:var(--font-form)] text-sm text-sienna">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full bg-olive font-[family-name:var(--font-form)] text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? t["olvide.pending"] : t["olvide.submit"]}
          </button>
        </form>
      )}
    </main>
  );
}
