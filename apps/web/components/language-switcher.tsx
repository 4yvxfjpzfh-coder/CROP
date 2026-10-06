"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { setLangAction } from "@/lib/i18n-actions";
import { LANG_SWITCH_LABEL, type Lang } from "@/lib/i18n-shared";

const GAP = 16;

/**
 * Botón de traducción. Cambia el idioma de toda la app: los textos de
 * interfaz salen de la traducción escrita a mano (lib/site-text-en.ts) y lo
 * que escriba el admin (productos, textos editados) se traduce solo con
 * lib/i18n.ts y queda guardado.
 *
 * Va fijo en una esquina para estar en todas las pantallas sin tener que
 * tocar cada encabezado:
 *  - en los paneles internos va a la derecha (a la izquierda está la barra
 *    lateral de admin/agricultor);
 *  - en la tienda va a la izquierda, subiéndose por encima de cualquier barra
 *    fija inferior (aviso de cookies, carrito) marcada con data-bottom-bar.
 *
 * print:hidden para que no salga en la hoja de feria.
 */
export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [offset, setOffset] = useState(0);
  const next: Lang = lang === "es" ? "en" : "es";
  const onPanel = pathname.startsWith("/admin") || pathname.startsWith("/agricultor");

  // Mide la barra fija inferior más alta que esté visible y se coloca encima.
  // Sirve para el aviso de cookies y para la barra del carrito, que aparece y
  // desaparece según lo que el cliente vaya agregando.
  useEffect(() => {
    if (onPanel) return; // en los paneles no hay barras inferiores que esquivar
    const compute = () => {
      let tallest = 0;
      for (const el of document.querySelectorAll<HTMLElement>("[data-bottom-bar]")) {
        const r = el.getBoundingClientRect();
        // Solo las que de verdad están pegadas abajo y visibles.
        if (r.height > 0 && r.bottom >= window.innerHeight - 2) tallest = Math.max(tallest, r.height);
      }
      setOffset(tallest);
    };
    // Se mide despues del primer pintado: setState sincrono dentro del efecto
    // dispara renders en cascada (y lo marca el lint del proyecto).
    const first = requestAnimationFrame(compute);
    const observer = new MutationObserver(compute);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(first);
      observer.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [pathname, onPanel]);

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={lang === "es" ? "Translate this site to English" : "Traducir este sitio al español"}
      onClick={() =>
        startTransition(async () => {
          await setLangAction(next);
          // Recarga completa a propósito: el idioma cambia TODO (layout, menús,
          // metadatos y datos ya traducidos). Un refresh suave dejaba partes de
          // la página en el idioma anterior.
          window.location.reload();
        })
      }
      style={{ bottom: GAP + (onPanel ? 0 : offset) }}
      className={`fixed z-[70] inline-flex items-center gap-1.5 rounded-full border border-olive/25 bg-cream/95 px-3 py-2 font-[family-name:var(--font-form)] text-sm font-medium text-olive shadow-md backdrop-blur transition-all hover:border-olive disabled:opacity-60 print:hidden ${
        onPanel ? "right-4" : "left-4"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2.75 12h18.5M12 2.75c2.5 2.6 2.5 15.9 0 18.5M12 2.75c-2.5 2.6-2.5 15.9 0 18.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {pending ? "…" : LANG_SWITCH_LABEL[lang]}
    </button>
  );
}
