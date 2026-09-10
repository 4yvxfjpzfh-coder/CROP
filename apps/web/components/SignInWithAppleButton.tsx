"use client";

import { signIn } from "next-auth/react";

/**
 * Botón "Iniciar sesión con Apple" siguiendo las guías de Apple:
 *  - texto exacto y localizado (no "Continuar", no texto libre)
 *  - logotipo de Apple a la izquierda
 *  - altura mínima 44px, esquinas ~6px, sin gradientes ni colores propios
 *  - variante negra (texto blanco) o blanca (texto negro con borde)
 *  - tipografía del sistema
 *
 * Ref: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
 */
export function SignInWithAppleButton({
  variant = "black",
  disabled = false,
  callbackUrl = "/welcome",
  label = "Iniciar sesión con Apple",
}: {
  variant?: "black" | "white";
  disabled?: boolean;
  callbackUrl?: string;
  label?: string;
}) {
  const black = variant === "black";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => signIn("apple", { callbackUrl })}
      aria-label={label}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
      className={[
        "flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-[17px] font-medium leading-none transition-opacity",
        black
          ? "bg-black text-white"
          : "border border-black bg-white text-black",
        disabled ? "cursor-not-allowed opacity-40" : "hover:opacity-90",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="-mt-0.5"
      >
        <path
          d="M13.29 10.62c.02 2.36 2.07 3.15 2.1 3.16-.02.06-.33 1.13-1.08 2.23-.65.96-1.32 1.91-2.38 1.93-1.04.02-1.38-.62-2.57-.62-1.19 0-1.56.6-2.55.64-1.02.04-1.8-1.04-2.46-2-1.34-1.94-2.37-5.48-.99-7.88.68-1.19 1.9-1.94 3.23-1.96 1-.02 1.95.68 2.57.68.61 0 1.76-.84 2.97-.71.51.02 1.93.2 2.85 1.55-.07.05-1.7 1-1.68 2.95M11.35 3.3C11.9 2.63 12.27 1.7 12.17.77c-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.53-.84 2.44.88.07 1.78-.45 2.34-1.1"
          fill={black ? "#fff" : "#000"}
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
