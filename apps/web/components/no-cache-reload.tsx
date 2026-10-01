"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dos capas de protección contra datos viejos en los paneles admin/agricultor:
 *
 * 1. router.refresh() en cada montaje: el router cache de Next.js App Router
 *    puede servir datos de hace unos segundos cuando navegás entre rutas con
 *    el sidebar. refresh() le dice a Next.js que vuelva a pedir los datos del
 *    servidor para la ruta actual sin recargar la página.
 *
 * 2. pageshow con persisted=true: el bfcache del WebView de Capacitor guarda
 *    el HTML completo en memoria y lo muestra sin tocar el servidor cuando
 *    usás "atrás". Esto lo detectamos y forzamos window.location.reload().
 */
export function NoCacheReload() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();

    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
