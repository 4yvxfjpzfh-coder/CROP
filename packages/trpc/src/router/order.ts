import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma, OrderStatus } from "@meguru/prisma";
import type { Product } from "@meguru/prisma";
import { router, publicProcedure } from "../../index";

// Ventana por defecto para pasar a recoger un apartado.
const DEFAULT_PICKUP_WINDOW_HOURS = 24;

export const orderRouter = router({
  reserve: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        businessId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              quantity: z.number().int().positive().default(1),
            })
          )
          .min(1),
        pickupBy: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `El usuario ${input.userId} no existe`,
        });
      }

      // Un mismo producto puede venir repetido en el input; se consolidan las
      // cantidades para validar y descontar el inventario una sola vez.
      const requested = new Map<string, number>();
      for (const item of input.items) {
        requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity);
      }

      const products = await prisma.product.findMany({
        where: { id: { in: [...requested.keys()] } },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      const lines: { product: Product; quantity: number }[] = [];

      for (const [productId, quantity] of requested) {
        const product = productsById.get(productId);

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `El producto ${productId} no existe`,
          });
        }

        if (product.businessId !== input.businessId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `El producto ${product.name} no pertenece a este negocio`,
          });
        }

        if (!product.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `El producto ${product.name} ya no está disponible`,
          });
        }

        if (product.quantity < quantity) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Solo quedan ${product.quantity} unidades de ${product.name}`,
          });
        }

        lines.push({ product, quantity });
      }

      const now = new Date();
      const pickupBy =
        input.pickupBy ??
        new Date(now.getTime() + DEFAULT_PICKUP_WINDOW_HOURS * 60 * 60 * 1000);

      if (pickupBy <= now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La fecha límite para recoger debe ser futura",
        });
      }

      return prisma.$transaction(async (tx) => {
        for (const line of lines) {
          // El descuento es condicional para que dos apartados simultáneos no
          // puedan dejar el inventario en negativo.
          const claimed = await tx.product.updateMany({
            where: {
              id: line.product.id,
              isActive: true,
              quantity: { gte: line.quantity },
            },
            data: { quantity: { decrement: line.quantity } },
          });

          if (claimed.count === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `El producto ${line.product.name} se quedó sin unidades suficientes`,
            });
          }
        }

        return tx.order.create({
          data: {
            userId: input.userId,
            businessId: input.businessId,
            pickupBy,
            items: {
              create: lines.map((line) => ({
                productId: line.product.id,
                quantity: line.quantity,
                unitPriceCents: line.product.discountPriceCents,
              })),
            },
          },
          include: { items: { include: { product: true } } },
        });
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.order.findUnique({
        where: { id: input.id },
        include: { business: true, items: { include: { product: true } } },
      });
    }),

  listByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.order.findMany({
        where: { userId: input.userId },
        include: { business: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: input.id },
          include: { items: true },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `El pedido ${input.id} no existe`,
          });
        }

        if (order.status === input.status) {
          return order;
        }

        if (input.status === OrderStatus.RESERVED) {
          // Volver a RESERVED implicaría reclamar inventario de nuevo, que
          // pudo haber sido apartado por alguien más mientras tanto.
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Un pedido no puede volver a apartarse; hay que crear uno nuevo",
          });
        }

        const releasesStock =
          order.status === OrderStatus.RESERVED &&
          (input.status === OrderStatus.CANCELLED || input.status === OrderStatus.EXPIRED);

        if (releasesStock) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { quantity: { increment: item.quantity } },
            });
          }
        }

        return tx.order.update({
          where: { id: input.id },
          data: { status: input.status },
          include: { items: true },
        });
      });
    }),
});
