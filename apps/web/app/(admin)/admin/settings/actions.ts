"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";
import { isValidHexColor, isValidExchangeRate } from "@/lib/site-settings";

export type SettingsResult = { ok: boolean; error?: string };

function refreshHome() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/settings");
}

// Se agregó después de que alguien pegara el link de una página de
// resultados de búsqueda de Bing en vez de la foto en sí: la página cargaba
// bien en el navegador del admin (es HTML real), pero como <img src> en el
// sitio público solo mostraba el texto alternativo. Un HEAD alcanza para
// distinguir "esto es un archivo de imagen" de "esto es una página" sin
// descargar la imagen entera.
async function assertIsDirectImageUrl(url: string): Promise<string | null> {
  // Subidas con PhotoUpload van a Vercel Blob (empiezan con esto) o son
  // rutas locales de /public -- ambas son confiables, no hace falta pegarle
  // a la red para confirmarlas.
  if (url.startsWith("/") || url.includes(".blob.vercel-storage.com")) return null;

  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.startsWith("image/")) {
      return "Ese link no es un archivo de imagen directo (parece una página, no una foto). " +
        "Si lo copiaste desde una búsqueda de Google o Bing, abrí la foto en una pestaña nueva primero " +
        "y copiá esa URL -- o mejor, usá el botón de subir foto.";
    }
  } catch {
    return "No se pudo comprobar esa URL. Revisá que esté bien copiada o subí el archivo con el botón de foto.";
  }
  return null;
}

async function guard(): Promise<SettingsResult | null> {
  try {
    await requireAdmin("throw");
    return null;
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }
}

// Antes había un solo formulario gigante con un único botón "Guardar" al
// final -- si alguien subía una foto o elegía un color pero no bajaba hasta
// ese botón (fácil de no ver, sobre todo en el celular), nada se guardaba y
// no había forma de saber por qué. Cada sección ahora es su propio form con
// su propio botón inmediato debajo, y su propia acción que solo toca su
// campo -- así una sección nunca puede pisar el valor de otra por accidente.
//
// runUpsert además atrapa cualquier excepción (ej. la DB de Neon se durmió
// y tarda en responder) y la devuelve como texto en vez de dejar que se
// pierda en un error genérico de Next.js: así, si esto vuelve a fallar en
// producción, el mensaje de error real queda visible en la pantalla del
// admin en vez de que parezca que "no pasó nada".
async function runUpsert(data: Record<string, unknown>): Promise<SettingsResult> {
  try {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
  } catch (err) {
    return { ok: false, error: `No se pudo guardar: ${err instanceof Error ? err.message : String(err)}` };
  }
  refreshHome();
  return { ok: true };
}

export async function saveHeadlineSubtext(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const homeHeadline = String(formData.get("homeHeadline") ?? "").trim();
  const homeSubtext = String(formData.get("homeSubtext") ?? "").trim();

  return runUpsert({ homeHeadline: homeHeadline || null, homeSubtext: homeSubtext || null });
}

export async function saveBackgroundPhoto(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const homeBackgroundUrl = String(formData.get("homeBackgroundUrl") ?? "").trim();
  if (homeBackgroundUrl) {
    const error = await assertIsDirectImageUrl(homeBackgroundUrl);
    if (error) return { ok: false, error };
  }

  return runUpsert({ homeBackgroundUrl: homeBackgroundUrl || null });
}

export async function saveHeroImage(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim();
  if (heroImageUrl) {
    const error = await assertIsDirectImageUrl(heroImageUrl);
    if (error) return { ok: false, error };
  }

  return runUpsert({ heroImageUrl: heroImageUrl || null });
}

export async function saveBrandTextColor(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const brandTextColorRaw = String(formData.get("brandTextColor") ?? "").trim();
  if (brandTextColorRaw && !isValidHexColor(brandTextColorRaw)) {
    return { ok: false, error: "El color tiene que ser un hex válido, ej. #1f2a22" };
  }
  // #1f2a22 es el olivo original: guardarlo como null (no como el mismo
  // valor) mantiene layout.tsx sin inyectar una etiqueta <style> de más
  // cuando el admin en realidad no cambió nada del color.
  const brandTextColor =
    brandTextColorRaw && brandTextColorRaw.toLowerCase() !== "#1f2a22" ? brandTextColorRaw : null;

  return runUpsert({ brandTextColor });
}

export async function saveExchangeRate(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const raw = String(formData.get("usdExchangeRate") ?? "").trim();
  const usdExchangeRate = Number(raw);
  if (!isValidExchangeRate(usdExchangeRate)) {
    return { ok: false, error: "Poné un número de colones por dólar razonable (entre 100 y 2000)." };
  }

  return runUpsert({ usdExchangeRate });
}

export async function addHomeFruit(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const name = String(formData.get("name") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  if (!name || !imageUrl) return { ok: false, error: "Nombre e imagen son obligatorios" };

  const imageError = await assertIsDirectImageUrl(imageUrl);
  if (imageError) return { ok: false, error: imageError };

  try {
    const agg = await prisma.homeFruit.aggregate({ _max: { position: true } });
    await prisma.homeFruit.create({
      data: { name, imageUrl, blurb, position: (agg._max.position ?? 0) + 1 },
    });
  } catch (err) {
    return { ok: false, error: `No se pudo guardar: ${err instanceof Error ? err.message : String(err)}` };
  }

  refreshHome();
  return { ok: true };
}

// Antes la única forma de corregir una fruta (ej. una foto rota) era
// quitarla y cargarla de nuevo -- fácil de pasar por alto que existía esa
// opción. Edita en el lugar, con la misma validación de imagen que agregar.
export async function updateHomeFruit(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  if (!id || !name || !imageUrl) return { ok: false, error: "Nombre e imagen son obligatorios" };

  const imageError = await assertIsDirectImageUrl(imageUrl);
  if (imageError) return { ok: false, error: imageError };

  try {
    await prisma.homeFruit.update({ where: { id }, data: { name, imageUrl, blurb } });
  } catch (err) {
    return { ok: false, error: `No se pudo guardar: ${err instanceof Error ? err.message : String(err)}` };
  }

  refreshHome();
  return { ok: true };
}

export async function removeHomeFruit(id: string): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  try {
    await prisma.homeFruit.delete({ where: { id } });
  } catch (err) {
    return { ok: false, error: `No se pudo quitar: ${err instanceof Error ? err.message : String(err)}` };
  }

  refreshHome();
  return { ok: true };
}
