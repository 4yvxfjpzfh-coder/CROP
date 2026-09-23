import { prisma } from "@crop/prisma";
import { MAX_PICKUP_WINDOW_HOURS } from "./pickup-window";

export type SiteSettingsData = {
  homeBackgroundUrl: string | null;
  homeHeadline: string | null;
  homeSubtext: string | null;
  pickupWindowHours: number;
};

// Tope duro: los apartados vencen a más tardar 2 horas después de hacerse.
// El admin puede poner menos horas, pero nunca más, incluso si en la base
// quedó guardado un valor viejo más alto. La constante en sí vive en
// lib/pickup-window.ts (sin Prisma) para que un componente cliente la
// pueda importar sin arrastrar @crop/prisma al bundle del navegador; acá
// se re-exporta para no romper a quienes ya la importan desde este archivo.
export { MAX_PICKUP_WINDOW_HOURS };

const DEFAULTS: SiteSettingsData = {
  homeBackgroundUrl: null,
  homeHeadline: null,
  homeSubtext: null,
  pickupWindowHours: MAX_PICKUP_WINDOW_HOURS,
};

/**
 * Lee /admin/settings. Nunca tira: si la DB está caída (pasó varias veces con
 * el plan gratis de Neon), se usan los valores por defecto en vez de romper
 * la página entera por esto.
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!settings) return DEFAULTS;
    return {
      homeBackgroundUrl: settings.homeBackgroundUrl,
      homeHeadline: settings.homeHeadline,
      homeSubtext: settings.homeSubtext,
      pickupWindowHours: Math.min(settings.pickupWindowHours, MAX_PICKUP_WINDOW_HOURS),
    };
  } catch (err) {
    console.error("[site-settings] no se pudo leer SiteSettings:", err);
    return DEFAULTS;
  }
}

/** Solo la foto de fondo — usado en /catalogo, que no necesita el resto. */
export async function getHomeBackgroundUrl(): Promise<string | null> {
  const settings = await getSiteSettings();
  return settings.homeBackgroundUrl;
}

export type HomeFruitData = { id: string; name: string; imageUrl: string; blurb: string };

/** Frutas del carrusel del home, editables desde /admin/settings. Nunca tira. */
export async function getHomeFruits(): Promise<HomeFruitData[]> {
  try {
    const fruits = await prisma.homeFruit.findMany({ orderBy: { position: "asc" } });
    return fruits.map((f) => ({ id: f.id, name: f.name, imageUrl: f.imageUrl, blurb: f.blurb }));
  } catch (err) {
    console.error("[site-settings] no se pudo leer HomeFruit:", err);
    return [];
  }
}
