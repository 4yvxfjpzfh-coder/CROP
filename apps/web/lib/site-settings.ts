import { prisma } from "@crop/prisma";

/**
 * Lee la foto de fondo configurada en /admin/settings. Nunca tira: si la DB
 * está caída (pasó varias veces con el plan gratis de Neon), la página sigue
 * cargando con el fondo por defecto en vez de romperse entera por esto.
 */
export async function getHomeBackgroundUrl(): Promise<string | null> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return settings?.homeBackgroundUrl ?? null;
  } catch (err) {
    console.error("[site-settings] no se pudo leer homeBackgroundUrl:", err);
    return null;
  }
}
