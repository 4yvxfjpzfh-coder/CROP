"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";

const PICKUP_WINDOW_HOURS = 24;

export type ReserveResult =
  | { ok: true; orderId: string; pickupBy: string }
  | { ok: false; error: string };

/**
 * Aparta 1+ unidades de un producto para el usuario autenticado.
 * Sin cobro: crea una Order en estado RESERVED con fecha límite de recogida.
 * Descuenta el stock de forma condicional para que dos apartados simultáneos
 * no dejen el inventario en negativo.
 */
export async function reserveProduct(
  _prev: ReserveResult | null,
  formData: FormData,
): Promise<ReserveResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/catalogo");
  }
  const userId = session.user.id;

  const productId = String(formData.get("productId") ?? "");
  const quantity = Math.max(1, Math.trunc(Number(formData.get("quantity") ?? 1)) || 1);
  if (!productId) return { ok: false, error: "Producto inválido" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return { ok: false, error: "El producto ya no está disponible" };
  }
  if (product.quantity < quantity) {
    return { ok: false, error: `Solo quedan ${product.quantity} unidades` };
  }

  const pickupBy = new Date(Date.now() + PICKUP_WINDOW_HOURS * 3600 * 1000);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const claimed = await tx.product.updateMany({
        where: { id: productId, isActive: true, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (claimed.count === 0) throw new Error("stock");

      return tx.order.create({
        data: {
          userId,
          businessId: product.businessId, // puede ser null
          pickupBy,
          items: {
            create: [
              {
                productId,
                quantity,
                unitPriceCents: product.discountPriceCents,
              },
            ],
          },
        },
      });
    });

    revalidatePath("/catalogo");
    revalidatePath("/mis-apartados");
    return { ok: true, orderId: order.id, pickupBy: pickupBy.toISOString() };
  } catch {
    return { ok: false, error: "No se pudo apartar. Probá de nuevo." };
  }
}
