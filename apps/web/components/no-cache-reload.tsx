"use client";

import { useEffect } from "react";

/**
 * Cuando el WebView de Capacitor (iOS/Android) restaura la página desde el
 * bfcache (back-forward cache), muestra el HTML que tenía en memoria sin
 * pedir nada al servidor — ignorando completamente Cache-Control: no-store.
 * Este componente escucha el evento "pageshow": si persisted=true, significa
 * que viene del bfcache y fuerza una recarga inmediata para que el servidor
 * sirva datos frescos.
 */
export function NoCacheReload() {
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
