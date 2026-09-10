import { prisma, OrderStatus } from "@meguru/prisma";

const DEFAULT_LIMIT = 100;

export type ReleaseExpiredOptions = {
  /** Acota el barrido a un solo negocio. Sin esto, revisa todos. */
  businessId?: string;
  /** Máximo de pedidos a procesar por corrida. */
  limit?: number;
};

export type ReleaseExpiredResult = {
  scanned: number;
  released: number;
};

/**
 * Marca como EXPIRED los apartados cuya fecha límite de recolección ya pasó y
 * devuelve las unidades al inventario del producto.
 *
 * Es idempotente y seguro de correr en paralelo: cada pedido se "reclama" con
 * un update condicional sobre el status, así que dos corridas traslapadas no
 * pueden devolver el mismo stock dos veces.
 */
export async function releaseExpiredOrders(
  options: ReleaseExpiredOptions = {}
): Promise<ReleaseExpiredResult> {
  const { businessId, limit = DEFAULT_LIMIT } = options;

  const candidates = await prisma.order.findMany({
    where: {
      status: OrderStatus.RESERVED,
      pickupBy: { lt: new Date() },
      ...(businessId ? { businessId } : {}),
    },
    select: { id: true },
    orderBy: { pickupBy: "asc" }, // los más vencidos primero
    take: limit,
  });

  let released = 0;

  for (const candidate of candidates) {
    const wasReleased = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: candidate.id, status: OrderStatus.RESERVED },
        data: { status: OrderStatus.EXPIRED },
      });

      // Otra corrida (o una cancelación manual) se adelantó y ya lo movió de
      // RESERVED; el stock lo devuelve quien haya ganado el update.
      if (claimed.count === 0) {
        return false;
      }

      const items = await tx.orderItem.findMany({
        where: { orderId: candidate.id },
        select: { productId: true, quantity: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      return true;
    });

    if (wasReleased) {
      released++;
    }
  }

  return { scanned: candidates.length, released };
}
