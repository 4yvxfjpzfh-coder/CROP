"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "crop-cookie-consent";

/**
 * Aviso de cookies. Crop solo usa las cookies estrictamente necesarias para
 * la sesión de Auth.js (no hay analítica ni publicidad), así que esto es un
 * aviso informativo, no un selector de categorías opcionales.
 *
 * No se muestra en /admin ni /agricultor: son paneles internos para gente ya
 * logueada trabajando, y el banner fijo abajo tapaba botones de formularios.
 */
export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const isInternalPanel = pathname.startsWith("/admin") || pathname.startsWith("/agricultor");
  if (!visible || isInternalPanel) return null;

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-cream-200 bg-olive px-6 py-4 text-cream">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 font-[family-name:var(--font-form)] text-sm">
        <p className="max-w-2xl leading-relaxed">
          Usamos únicamente las cookies necesarias para mantener tu sesión
          iniciada. No usamos cookies de publicidad ni de analítica de
          terceros.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Política de Privacidad
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 bg-cream px-4 py-2 text-sm text-olive hover:opacity-90"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
