"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";

// process.env.NODE_ENV se reemplaza en build time; en el bundle de producción
// (next build/start, lo que corre Vercel) esta rama nunca se incluye.
const DEV_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

export default function SignInPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Entrar a Crop</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Aparta productos de excedente agrícola y recógelos en la feria del
          agricultor. No se cobra en línea.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="text-sm leading-relaxed text-neutral-700">
          Al crear tu cuenta con Apple guardamos tu nombre y correo para
          identificarte y gestionar tus apartados. Podés eliminar tu cuenta y tus
          datos en cualquier momento desde tu perfil.
        </p>

        <label className="mt-4 flex items-start gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-neutral-900"
          />
          <span>
            He leído y acepto la{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Política de Privacidad
            </Link>{" "}
            y los{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Términos de Servicio
            </Link>
            .
          </span>
        </label>
      </div>

      <div>
        <SignInWithAppleButton disabled={!accepted} callbackUrl="/welcome" />
        {!accepted && (
          <p className="mt-2 text-center text-xs text-neutral-500">
            Aceptá los términos para continuar.
          </p>
        )}
      </div>

      {DEV_LOGIN_ENABLED && (
        <div className="border-t border-dashed border-neutral-300 pt-4">
          <button
            type="button"
            onClick={() => signIn("dev-admin", { callbackUrl: "/admin" })}
            className="h-11 w-full rounded-md border border-neutral-300 bg-neutral-50 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Entrar como admin (solo desarrollo)
          </button>
          <p className="mt-1 text-center text-xs text-neutral-400">
            Atajo local mientras no hay Sign in with Apple configurado. No
            existe en producción.
          </p>
        </div>
      )}
    </main>
  );
}
