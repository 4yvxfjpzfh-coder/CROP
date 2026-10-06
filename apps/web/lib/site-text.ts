import { cache } from "react";
import { prisma } from "@crop/prisma";
import { SITE_TEXT_DEFAULTS } from "./site-text-defaults";
import { SITE_TEXT_EN } from "./site-text-en";
import { DEFAULT_LANG, getLang, translateMany, type Lang } from "./i18n";

export type SiteTextMap = Record<string, string>;

const BASE_BY_LANG: Record<Lang, SiteTextMap> = {
  es: SITE_TEXT_DEFAULTS,
  en: SITE_TEXT_EN,
};

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
});
