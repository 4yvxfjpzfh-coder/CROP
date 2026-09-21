"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";
import { recordAdminAudit } from "@/lib/audit";

export type FarmerActionResult = { ok: boolean; error?: string };

/**
 * Promueve una cuenta existente a rol FARMER. La persona tiene que haber
 * iniciado sesión al menos una vez (con Apple, o el login de desarrollo)
 * para que su fila de User ya exista — igual que la promoción a ADMIN.
 */
export async function makeFarmer(
  _prev: FarmerActionResult | null,
  formData: FormData,
): Promise<FarmerActionResult> {
  let actor;
  try {
    actor = await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Falta el correo" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: false,
      error: "No existe ninguna cuenta con ese correo. Tiene que iniciar sesión al menos una vez primero.",
    };
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: "FARMER" } });

  await recordAdminAudit({
    actor,
    action: "PRODUCT_UPDATE",
    entityType: "User",
    entityId: user.id,
    summary: `Asignó rol FARMER a ${email}`,
  });

  revalidatePath("/admin/agricultores");
  return { ok: true };
}

/** Quita el rol FARMER (vuelve a USER). No borra ni desvincula sus productos. */
export async function removeFarmerRole(userId: string): Promise<FarmerActionResult> {
  let actor;
  try {
    actor = await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });

  await recordAdminAudit({
    actor,
    action: "PRODUCT_UPDATE",
    entityType: "User",
    entityId: user.id,
    summary: `Quitó el rol FARMER a ${user.email ?? user.id}`,
  });

  revalidatePath("/admin/agricultores");
  return { ok: true };
}
