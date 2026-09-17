"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";
import { SITE_TEXT_GROUPS } from "@/lib/site-text-defaults";

export type SiteTextResult = { ok: boolean; error?: string };

/**
 * Guarda solo los campos que realmente cambiaron (compara contra las filas
 * existentes primero). El formulario manda las ~90 keys en cada submit, pero
 * mandar 90 upserts/deletes por guardado — casi todos no-ops — es lento y
 * gasta conexiones del pool de Neon de más. Con esto una edición típica de 1
 * o 2 campos hace 1 lectura + 1-2 escrituras, no ~90.
 */
export async function saveSiteTexts(
  _prev: SiteTextResult | null,
  formData: FormData,
): Promise<SiteTextResult> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  const allKeys = SITE_TEXT_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
  const existingRows = await prisma.siteText.findMany({ where: { key: { in: allKeys } } });
  const existing = new Map(existingRows.map((r) => [r.key, r.value]));

  const ops = [];
  for (const key of allKeys) {
    const raw = formData.get(key);
    const value = typeof raw === "string" ? raw.trim() : "";
    const current = existing.get(key);
    if (!value) {
      if (current !== undefined) ops.push(prisma.siteText.delete({ where: { key } }));
    } else if (value !== current) {
      ops.push(
        prisma.siteText.upsert({ where: { key }, create: { key, value }, update: { value } }),
      );
    }
  }

  if (ops.length > 0) await prisma.$transaction(ops);

  revalidatePath("/", "layout");
  revalidatePath("/admin/textos");
  return { ok: true };
}
