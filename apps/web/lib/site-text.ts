import { cache } from "react";
import { prisma } from "@crop/prisma";
import { SITE_TEXT_DEFAULTS } from "./site-text-defaults";

export type SiteTextMap = Record<string, string>;

/**
 * Lee las overrides de /admin/textos y las mezcla con los defaults. Cacheado
 * por request (React cache) para que varias páginas/componentes que lo piden
 * en el mismo render no disparen la misma consulta varias veces.
 *
 * Nunca tira: si la DB está caída, se usan los defaults (mismo patrón que
 * getSiteSettings en lib/site-settings.ts).
 */
export const getSiteTexts = cache(async (): Promise<SiteTextMap> => {
  try {
    const rows = await prisma.siteText.findMany();
    if (rows.length === 0) return { ...SITE_TEXT_DEFAULTS };
    const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...SITE_TEXT_DEFAULTS, ...overrides };
  } catch (err) {
    console.error("[site-text] no se pudo leer SiteText:", err);
    return { ...SITE_TEXT_DEFAULTS };
  }
});
