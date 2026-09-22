"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerCustomer, type RegisterResult } from "./actions";
import { linkifyText } from "@/components/linkify-text";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function RegisterClient({ texts: t }: { texts: Record<string, string> }) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [state, formAction, pending] = useActionState<RegisterResult | null, FormData>(
    registerCustomer,
    null,
  );

  useEffect(() => {
    if (!state?.ok) return;
    setLoggingIn(true);
    signIn("password", { email, password, redirect: false }).then(() => {
      router.push("/catalogo");
      router.refresh();
    });
  }, [state, email, password, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <Link
        href="/"
        className="-mb-4 w-fit font-[family-name:var(--font-form)] text-sm text-stone underline underline-offset-2 hover:text-olive"
      >
        {t["nav.volver_inicio"]}
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          {t["registro.heading"]}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
          {t["registro.subtext"]}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="name"
          required
          autoComplete="name"
          placeholder={t["registro.name_placeholder"]}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t["registro.email_placeholder"]}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={t["registro.password_placeholder"]}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />

        <label className="flex items-start gap-3 font-[family-name:var(--font-form)] text-sm text-olive">
          <input
            type="checkbox"
            name="accepted"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-olive"
          />
          <span>
            {linkifyText(t["signin.checkbox_label"], [
              { label: t["footer.privacidad"], href: "/privacy" },
              { label: t["footer.terminos"], href: "/terms" },
            ])}
          </span>
        </label>

        {state && !state.ok && (
          <p className="font-[family-name:var(--font-form)] text-sm text-sienna">{state.error}</p>
        )}
        {state?.ok && (
          <p className="font-[family-name:var(--font-form)] text-sm text-olive">
            {t["registro.success"]}
          </p>
        )}

        <button
          type="submit"
          disabled={!accepted || pending || loggingIn}
          className="h-11 w-full bg-olive font-[family-name:var(--font-form)] text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending || loggingIn ? t["registro.pending"] : t["registro.submit"]}
        </button>

        <p className="text-center font-[family-name:var(--font-form)] text-xs text-stone">
          {t["registro.have_account"]}{" "}
          <Link href="/signin" className="underline underline-offset-2">
            {t["nav.entrar"]}
          </Link>
        </p>
      </form>
    </main>
  );
}
