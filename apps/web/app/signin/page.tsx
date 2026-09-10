"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";

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
    </main>
  );
}
