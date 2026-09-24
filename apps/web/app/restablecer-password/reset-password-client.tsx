"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword, type ResetPasswordResult } from "./actions";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function ResetPasswordClient({ token, texts: t }: { token: string; texts: Record<string, string> }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ResetPasswordResult | null, FormData>(
    resetPassword,
    null,
  );

  if (state?.ok) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 bg-cream px-6 py-16">
        <p className="border-l-2 border-gold bg-gold/10 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
          {t["restablecer.success"]}
        </p>
        <button
          type="button"
          onClick={() => router.push("/signin")}
          className="h-11 w-full bg-olive font-[family-name:var(--font-form)] text-sm text-cream"
        >
          {t["olvide.volver_signin"]}
        </button>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 bg-cream px-6 py-16">
        <p className="font-[family-name:var(--font-form)] text-sm text-sienna">
          {t["restablecer.sin_token"]}
        </p>
        <Link
          href="/olvide-password"
          className="inline-block w-fit bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream"
        >
          {t["restablecer.pedir_nuevo"]}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 bg-cream px-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          {t["restablecer.heading"]}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
          {t["restablecer.subtext"]}
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="token" value={token} />
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder={t["restablecer.password_placeholder"]}
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
          {pending ? t["restablecer.pending"] : t["restablecer.submit"]}
        </button>
      </form>
    </main>
  );
}
