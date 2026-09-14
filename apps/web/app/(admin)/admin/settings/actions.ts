"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";

export type SettingsResult = { ok: boolean; error?: string };

export async function saveHomeBackground(
  _prev: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  const url = String(formData.get("homeBackgroundUrl") ?? "").trim();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { homeBackgroundUrl: url || null },
    create: { id: "default", homeBackgroundUrl: url || null },
  });

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/settings");
  return { ok: true };
}
