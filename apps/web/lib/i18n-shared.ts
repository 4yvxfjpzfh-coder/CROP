/**
 * Constantes de idioma sin nada del servidor, para que las pueda importar
 * tanto el servidor como un componente cliente (el botón de traducir).
 */
export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";
export const LANG_COOKIE = "crop_lang";

export const LANG_LABEL: Record<Lang, string> = { es: "Español", en: "English" };
/** Lo que muestra el botón: el idioma al que te va a llevar. */
export const LANG_SWITCH_LABEL: Record<Lang, string> = { es: "English", en: "Español" };

export function isLang(x: unknown): x is Lang {
  return typeof x === "string" && (LANGS as readonly string[]).includes(x);
}
