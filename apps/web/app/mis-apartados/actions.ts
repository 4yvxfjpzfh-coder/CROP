"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";

export type CancelResult = { ok: boolean; error?: string };

/**
 * Cancela un apartado propio antes de la fecha límite de recogida y devuelve
 * el stock al producto. Es la contraparte "manual" del cron que libera los
 * apartados vencidos automáticamente (apps/api/.../release-expired).
 */
export async function cancelOrder(orderId: string): Promise<CancelResult> {
  const session = await auth();
  const t = await getSiteTexts();
  if (!session?.user?.id) return { ok: false, error: t["apartados.error.not_authenticated"] };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    return { ok: false, error: t["apartados.error.not_found"] };
  }
  if (order.status !== "RESERVED") {
    return { ok: false, error: t["apartados.error.not_cancellable"] };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }
  });

  revalidatePath("/mis-apartados");
  revalidatePath("/catalogo");
  return { ok: true };
}
