"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";
import { isValidHexColor } from "@/lib/site-settings";

export type SettingsResult = { ok: boolean; error?: string };

function refreshHome() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/settings");
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

export async function saveHeadlineSubtext(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const homeHeadline = String(formData.get("homeHeadline") ?? "").trim();
  const homeSubtext = String(formData.get("homeSubtext") ?? "").trim();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { homeHeadline: homeHeadline || null, homeSubtext: homeSubtext || null },
    create: { id: "default", homeHeadline: homeHeadline || null, homeSubtext: homeSubtext || null },
  });

  refreshHome();
  return { ok: true };
}

export async function saveBackgroundPhoto(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const homeBackgroundUrl = String(formData.get("homeBackgroundUrl") ?? "").trim();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { homeBackgroundUrl: homeBackgroundUrl || null },
    create: { id: "default", homeBackgroundUrl: homeBackgroundUrl || null },
  });

  refreshHome();
  return { ok: true };
}

export async function saveHeroImage(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { heroImageUrl: heroImageUrl || null },
    create: { id: "default", heroImageUrl: heroImageUrl || null },
  });

  refreshHome();
  return { ok: true };
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

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { brandTextColor },
    create: { id: "default", brandTextColor },
  });

  refreshHome();
  return { ok: true };
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

  const agg = await prisma.homeFruit.aggregate({ _max: { position: true } });
  await prisma.homeFruit.create({
    data: { name, imageUrl, blurb, position: (agg._max.position ?? 0) + 1 },
  });

  refreshHome();
  return { ok: true };
}

export async function removeHomeFruit(id: string): Promise<SettingsResult> {
  const denied = await guard();
  if (denied) return denied;

  await prisma.homeFruit.delete({ where: { id } });
  refreshHome();
  return { ok: true };
}
