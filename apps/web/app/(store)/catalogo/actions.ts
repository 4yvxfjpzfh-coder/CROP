"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";

const MAX_QUANTITY_PER_RESERVATION = 10;
// Sin cobro de por medio, sin este tope una sola cuenta podría acaparar todo
// el excedente publicado. Los apartados vencidos (liberados por el cron de
// apps/api) no cuentan para este límite.
const MAX_ACTIVE_RESERVATIONS_PER_USER = 3;

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
  const t = await getSiteTexts();

  const productId = String(formData.get("productId") ?? "");
  const quantity = Math.min(
    MAX_QUANTITY_PER_RESERVATION,
    Math.max(1, Math.trunc(Number(formData.get("quantity") ?? 1)) || 1),
  );
  if (!productId) return { ok: false, error: t["catalogo.error.invalid_product"] };

  const activeReservations = await prisma.order.count({
    where: { userId, status: "RESERVED", pickupBy: { gt: new Date() } },
  });
  if (activeReservations >= MAX_ACTIVE_RESERVATIONS_PER_USER) {
    return {
      ok: false,
      error: `${t["catalogo.error.too_many_active_prefix"]} ${MAX_ACTIVE_RESERVATIONS_PER_USER} ${t["catalogo.error.too_many_active_suffix"]}`,
    };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return { ok: false, error: t["catalogo.error.product_unavailable"] };
  }
  if (product.quantity < quantity) {
    return {
      ok: false,
      error: `${t["catalogo.error.insufficient_stock_prefix"]} ${product.quantity} ${t["catalogo.error.insufficient_stock_suffix"]}`,
    };
  }

  const { pickupWindowHours } = await getSiteSettings();
  const pickupBy = new Date(Date.now() + pickupWindowHours * 3600 * 1000);

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
    return { ok: false, error: t["catalogo.error.generic"] };
  }
}
