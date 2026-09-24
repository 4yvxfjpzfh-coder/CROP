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

export async function saveHomeSettings(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  const homeBackgroundUrl = String(formData.get("homeBackgroundUrl") ?? "").trim();
  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim();
  const homeHeadline = String(formData.get("homeHeadline") ?? "").trim();
  const homeSubtext = String(formData.get("homeSubtext") ?? "").trim();
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
    update: {
      homeBackgroundUrl: homeBackgroundUrl || null,
      heroImageUrl: heroImageUrl || null,
      homeHeadline: homeHeadline || null,
      homeSubtext: homeSubtext || null,
      brandTextColor,
    },
    create: {
      id: "default",
      homeBackgroundUrl: homeBackgroundUrl || null,
      heroImageUrl: heroImageUrl || null,
      homeHeadline: homeHeadline || null,
      homeSubtext: homeSubtext || null,
      brandTextColor,
    },
  });

  refreshHome();
  return { ok: true };
}

export async function addHomeFruit(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

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
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  await prisma.homeFruit.delete({ where: { id } });
  refreshHome();
  return { ok: true };
}
