"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";

export async function markPickedUp(formData: FormData): Promise<void> {
  try {
    await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) return;
    throw err;
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  // Solo pasa de RESERVED a PICKED_UP: si ya venció o se canceló entre que
  // se cargó la página y se tocó el botón, este update no encuentra fila
  // que coincida y no hace nada (sin error, sin pisar un estado ya final).
  await prisma.order.updateMany({
    where: { id: orderId, status: "RESERVED" },
    data: { status: "PICKED_UP" },
  });

  revalidatePath("/admin/pedidos");
}
