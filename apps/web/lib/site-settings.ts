import { cache } from "react";
import { createHash } from "node:crypto";
import { prisma } from "@crop/prisma";
import { MAX_PICKUP_WINDOW_HOURS } from "./pickup-window";

export type SiteSettingsData = {
  homeBackgroundUrl: string | null;
  heroImageUrl: string | null;
  homeHeadline: string | null;
  homeSubtext: string | null;
  pickupWindowHours: number;
  brandTextColor: string | null;
  usdExchangeRate: number;
};

// Tope duro para el tipo de cambio: evita que un typo en /admin/settings
// (ej. escribir 5.2 en vez de 520, o un 0) deje el cobro de PayPal en un
// monto absurdo. 100–2000 cubre con margen cualquier valor real del
// colón frente al dólar.
export const MIN_USD_EXCHANGE_RATE = 100;
export const MAX_USD_EXCHANGE_RATE = 2000;
export const DEFAULT_USD_EXCHANGE_RATE = 520;

export function isValidExchangeRate(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_USD_EXCHANGE_RATE && value <= MAX_USD_EXCHANGE_RATE;
}

// Tope duro: los apartados vencen a más tardar 2 horas después de hacerse.
// El admin puede poner menos horas, pero nunca más, incluso si en la base
// quedó guardado un valor viejo más alto. La constante en sí vive en
// lib/pickup-window.ts (sin Prisma) para que un componente cliente la
// pueda importar sin arrastrar @crop/prisma al bundle del navegador; acá
// se re-exporta para no romper a quienes ya la importan desde este archivo.
export { MAX_PICKUP_WINDOW_HOURS };

const DEFAULTS: SiteSettingsData = {
  homeBackgroundUrl: null,
  heroImageUrl: null,
  homeHeadline: null,
  homeSubtext: null,
  pickupWindowHours: MAX_PICKUP_WINDOW_HOURS,
  brandTextColor: null,
  usdExchangeRate: DEFAULT_USD_EXCHANGE_RATE,
};

// Formato estricto #RRGGBB: esto se inyecta directo en una etiqueta <style>
// en el <head> (ver app/layout.tsx), así que se valida en dos puntos -- acá
// al leer, y de nuevo en el server action al guardar -- antes de confiar en
// que sea un color y no algo que rompa el CSS o inyecte otra cosa.
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

/**
 * Lee /admin/settings. Nunca tira: si la DB está caída (pasó varias veces con
 * el plan gratis de Neon), se usan los valores por defecto en vez de romper
 * la página entera por esto.
 */
/**
 * Las imágenes subidas desde el admin quedan como data URI (cientos de KB).
 * A las páginas públicas se les da una URL corta que las sirve aparte con
 * caché; sin esto cada página pesaba y tardaba muchísimo.
 */
function lightImage(value: string | null, path: string): string | null {
  if (!value || !value.startsWith("data:")) return value;
  const v = createHash("sha1").update(value).digest("hex").slice(0, 10);
  return `/api/imagen/${path}?v=${v}`;
}

// cache(): varias partes de la misma página la piden; así se lee una sola vez.
export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!settings) return DEFAULTS;
    return {
      homeBackgroundUrl: lightImage(settings.homeBackgroundUrl, "ajuste/fondo"),
      heroImageUrl: lightImage(settings.heroImageUrl, "ajuste/hero"),
      homeHeadline: settings.homeHeadline,
      homeSubtext: settings.homeSubtext,
      pickupWindowHours: Math.min(settings.pickupWindowHours, MAX_PICKUP_WINDOW_HOURS),
      brandTextColor:
        settings.brandTextColor && isValidHexColor(settings.brandTextColor)
          ? settings.brandTextColor
          : null,
      usdExchangeRate: isValidExchangeRate(settings.usdExchangeRate)
        ? settings.usdExchangeRate
        : DEFAULT_USD_EXCHANGE_RATE,
    };
  } catch (err) {
    console.error("[site-settings] no se pudo leer SiteSettings:", err);
    return DEFAULTS;
  }
});

/** Solo la foto de fondo — usado en /catalogo, que no necesita el resto. */
export async function getHomeBackgroundUrl(): Promise<string | null> {
  const settings = await getSiteSettings();
  return settings.homeBackgroundUrl;
}

/** Solo el color de letra — usado en el layout raíz, que no necesita el resto. */
export async function getBrandTextColor(): Promise<string | null> {
  const settings = await getSiteSettings();
  return settings.brandTextColor;
}

/**
 * Convierte un monto en céntimos de colón a un string USD con 2 decimales,
 * como lo pide la API de PayPal (ej. "12.34"). Redondea hacia arriba al
 * centavo de dólar para no cobrar de menos por redondeo.
 */
export function colonesCentsToUsdString(colonesCents: number, rate: number): string {
  const usd = colonesCents / 100 / rate;
  return (Math.ceil(usd * 100) / 100).toFixed(2);
}

export type HomeFruitData = { id: string; name: string; imageUrl: string; blurb: string };

/** Frutas del carrusel del home, editables desde /admin/settings. Nunca tira. */
export async function getHomeFruits(): Promise<HomeFruitData[]> {
  try {
    const fruits = await prisma.homeFruit.findMany({ orderBy: { position: "asc" } });
    return fruits.map((f) => ({
      id: f.id,
      name: f.name,
      imageUrl: lightImage(f.imageUrl, `fruta/${f.id}`) ?? f.imageUrl,
      blurb: f.blurb,
    }));
  } catch (err) {
    console.error("[site-settings] no se pudo leer HomeFruit:", err);
    return [];
  }
}
