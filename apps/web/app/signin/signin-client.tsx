"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SignInWithAppleButton } from "@/components/SignInWithAppleButton";

// process.env.NODE_ENV se reemplaza en build time; en el bundle de producción
// (next build/start, lo que corre Vercel) esta rama nunca se incluye.
const DEV_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

export function SignInClient({ appleConfigured }: { appleConfigured: boolean }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          Entrar a Crop
        </h1>
        <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
          Apartá productos de excedente agrícola y recogelos en la feria del
          agricultor. No se cobra en línea.
        </p>
      </div>

      <div className="border border-cream-200 bg-white p-4">
        <p className="font-[family-name:var(--font-form)] text-sm leading-relaxed text-olive">
          Al crear tu cuenta con Apple guardamos tu nombre y correo para
          identificarte y gestionar tus apartados. Podés eliminar tu cuenta y
          tus datos en cualquier momento desde tu perfil.
        </p>

        <label className="mt-4 flex items-start gap-3 font-[family-name:var(--font-form)] text-sm text-olive">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-olive"
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

      {appleConfigured ? (
        <div>
          <SignInWithAppleButton disabled={!accepted} callbackUrl="/welcome" />
          {!accepted && (
            <p className="mt-2 text-center font-[family-name:var(--font-form)] text-xs text-stone">
              Aceptá los términos para continuar.
            </p>
          )}
        </div>
      ) : (
        <div className="border-l-2 border-gold bg-gold/10 px-4 py-3">
          <p className="font-[family-name:var(--font-form)] text-sm text-olive">
            El inicio de sesión con Apple todavía no está configurado en este
            entorno.
          </p>
          {DEV_LOGIN_ENABLED && (
            <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
              Usá el acceso de desarrollo de abajo mientras tanto.
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
            Entrar como admin (solo desarrollo)
          </button>
          <p className="mt-1 text-center font-[family-name:var(--font-form)] text-xs text-stone">
            Atajo local, un clic, sin contraseña. No existe en producción.
          </p>
        </div>
      )}
    </main>
  );
}
