"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";

export type PickupDayResult = { ok: boolean; error?: string };

export async function updatePickupDay(id: string, pickupDay: number): Promise<PickupDayResult> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: err.message };
    throw err;
  }

  if (!Number.isInteger(pickupDay) || pickupDay < 0 || pickupDay > 6) {
    return { ok: false, error: "Día inválido" };
  }

  await prisma.pickupPoint.update({ where: { id }, data: { pickupDay } });

  revalidatePath("/admin/puntos-recogida");
  revalidatePath("/catalogo");
  return { ok: true };
}
