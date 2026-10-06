"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from "./i18n-shared";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Guarda el idioma elegido y vuelve a renderizar todo en ese idioma. */
export async function setLangAction(lang: Lang) {
  const value: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  (await cookies()).set(LANG_COOKIE, value, {
    httpOnly: false, // el idioma no es dato sensible; así el cliente también puede leerlo
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  // "layout": el idioma cambia el layout entero (menús, pie), no solo la página.
  revalidatePath("/", "layout");
}
