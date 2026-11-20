import { cache } from "react";
import { prisma } from "@crop/prisma";
import { SITE_TEXT_DEFAULTS } from "./site-text-defaults";
import { SITE_TEXT_EN } from "./site-text-en";
import { DEFAULT_LANG, getLang, translateMany, type Lang } from "./i18n";
import { renameMarket } from "./feria-name";

export type SiteTextMap = Record<string, string>;

const BASE_BY_LANG: Record<Lang, SiteTextMap> = {
  es: SITE_TEXT_DEFAULTS,
  en: SITE_TEXT_EN,
};

// La web ya no cobra con PayPal (solo SINPE Móvil o efectivo). Algunos textos
// que el admin dejó escritos en la base todavía ofrecen "pagar en línea con
// PayPal", una opción que ya no existe: se limpian al vuelo esas frases. Se
// tocan SOLO las que lo publicitan como forma de pago ("...o en línea con
// PayPal"), no cualquier aparición de la palabra (la política de privacidad
// menciona los datos de PayPal y no se debe alterar).
const PAYPAL_PHRASE_RENAMES: Array<[RegExp, string]> = [
  [/,?\s*(?:o\s+)?en l[ií]nea con PayPal\b/gi, ""],
  [/,?\s*or online with PayPal(?:\s+if you prefer)?\b/gi, ""],
];

// Reescritura de presentación sobre TODOS los textos (defaults + lo que el
// admin guardó en la base): el concepto pasó a llamarse "Mercado de Abastos
// Solidario" (renameMarket) y se quitan las menciones muertas a PayPal. Así el
// cambio se ve también en los textos que el admin ya tenía guardados (título
// de la pestaña, descripción para buscadores, subtítulo del encabezado...) sin
// tener que editarlos a mano uno por uno.
function polishSiteTexts(map: SiteTextMap): SiteTextMap {
  const out: SiteTextMap = {};
  for (const [key, value] of Object.entries(map)) {
    let v = renameMarket(value);
    for (const [re, replacement] of PAYPAL_PHRASE_RENAMES) v = v.replace(re, replacement);
    out[key] = v;
  }
  return out;
}

/**
 * Lee las overrides de /admin/textos y las mezcla con los defaults, en el
 * idioma que eligió el visitante. Cacheado por request (React cache) para que
 * varias páginas/componentes que lo piden en el mismo render no disparen la
 * misma consulta varias veces.
 *
 * En inglés:
 *  - la base es la traducción escrita a mano (site-text-en.ts), instantánea;
 *  - lo que el admin haya editado en español se traduce automáticamente y
 *    queda guardado, así un texto nuevo aparece traducido sin tocar código.
 *
 * Nunca tira: si la DB está caída o la traducción falla, se usa el español
 * (mismo patrón que getSiteSettings en lib/site-settings.ts).
 */
export const getSiteTexts = cache(async (): Promise<SiteTextMap> => {
  return polishSiteTexts(await loadSiteTexts());
});

async function loadSiteTexts(): Promise<SiteTextMap> {
  const lang = await getLang();
  const base = { ...SITE_TEXT_DEFAULTS, ...BASE_BY_LANG[lang] };

  let overrides: Record<string, string> = {};
  try {
    const rows = await prisma.siteText.findMany();
    overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch (err) {
    console.error("[site-text] no se pudo leer SiteText:", err);
    return base;
  }
  if (Object.keys(overrides).length === 0) return base;

  // En español las overrides se usan tal cual.
  if (lang === DEFAULT_LANG) return { ...base, ...overrides };

  // En otro idioma hay que traducirlas: son texto que escribió el admin.
  // Solo las que de verdad cambian algo respecto al default en español.
  const changed = Object.entries(overrides).filter(([k, v]) => v && v !== SITE_TEXT_DEFAULTS[k]);
  if (changed.length === 0) return base;

  const translated = await translateMany(
    changed.map(([, v]) => v),
    lang,
  );
  const out = { ...base };
  for (const [k, v] of changed) out[k] = translated.get(v.trim()) ?? v;
  return out;
}
