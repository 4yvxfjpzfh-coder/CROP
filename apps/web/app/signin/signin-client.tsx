"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";
import { linkifyText } from "@/components/linkify-text";

// process.env.NODE_ENV se reemplaza en build time; en el bundle de producción
// (next build/start, lo que corre Vercel) esta rama nunca se incluye.
const DEV_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

const field =
  "w-full border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function SignInClient({
  appleConfigured,
  texts: t,
}: {
  appleConfigured: boolean;
  texts: Record<string, string>;
}) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("password", { email, password, redirect: false });
    setPending(false);
    if (!res || res.error) {
      setError(t["signin.password_error"]);
      return;
    }
    router.push("/catalogo");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <Link
        href="/"
        className="-mb-2 inline-block w-fit bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream hover:opacity-90"
      >
        {t["nav.volver_inicio"]}
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          {t["signin.heading_prefix"]} <span className="uppercase">{t["brand.name"]}</span>
        </h1>
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
          {t["signin.subtext"]}
        </p>
      </div>

      <div className="border border-cream-200 bg-white p-4">
        <p className="font-[family-name:var(--font-form)] text-sm leading-relaxed text-olive">
          {t["signin.info_box"]}
        </p>

        <label className="mt-4 flex items-start gap-3 font-[family-name:var(--font-form)] text-sm text-olive">
          <input
            type="checkbox"
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
      </div>

      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={t["signin.email_placeholder"]}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder={t["signin.password_placeholder"]}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
        {error && (
          <p className="font-[family-name:var(--font-form)] text-sm text-sienna">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full bg-olive font-[family-name:var(--font-form)] text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? t["signin.password_pending"] : t["signin.password_button"]}
        </button>
        <p className="text-center font-[family-name:var(--font-form)] text-xs text-stone">
          {t["signin.no_account"]}{" "}
          <Link href="/registro" className="underline underline-offset-2">
            {t["nav.crear_cuenta"]}
          </Link>
        </p>
      </form>

      {appleConfigured ? (
        <div className="border-t border-dashed border-cream-200 pt-4">
          <SignInWithAppleButton disabled={!accepted} callbackUrl="/welcome" />
          {!accepted && (
            <p className="mt-2 text-center font-[family-name:var(--font-form)] text-xs text-stone">
              {t["signin.helper_accept_terms"]}
            </p>
          )}
        </div>
      ) : (
        <div className="border-l-2 border-gold bg-gold/10 px-4 py-3">
          <p className="font-[family-name:var(--font-form)] text-sm text-olive">
            {t["signin.apple_not_configured"]}
          </p>
          {DEV_LOGIN_ENABLED && (
            <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
              {t["signin.dev_hint"]}
            </p>
          )}
        </div>
      )}

      {DEV_LOGIN_ENABLED && (
        <div className={appleConfigured ? "border-t border-dashed border-cream-200 pt-4" : ""}>
          <button
            type="button"
            disabled={!accepted}
            onClick={() => signIn("dev-admin", { callbackUrl: "/admin" })}
            className="h-11 w-full bg-olive font-[family-name:var(--font-form)] text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t["signin.dev_button"]}
          </button>
          <p className="mt-1 text-center font-[family-name:var(--font-form)] text-xs text-stone">
            {t["signin.dev_helper"]}
          </p>
        </div>
      )}
    </main>
  );
}
