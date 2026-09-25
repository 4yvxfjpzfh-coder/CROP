"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";
import { resolvePickupDeadline } from "@/lib/pickup-schedule";
import { MAX_QUANTITY_PER_ITEM, MIN_ORDER_CENTS } from "./catalog-types";

// Los apartados vencidos (liberados por el cron de apps/api) no cuentan
// para este límite.
const MAX_ACTIVE_RESERVATIONS_PER_USER = 3;
// Antes (un producto = un apartado) este mismo tope de arriba ya evitaba que
// una sola cuenta acaparara todo el excedente. Ahora que un pedido puede
// traer varios productos distintos, hace falta este segundo tope para que
// un solo pedido no se lleve todo el catálogo de una feria.
const MAX_DISTINCT_PRODUCTS_PER_ORDER = 10;

export type PlaceOrderResult =
  | { ok: true; orderId: string; pickupBy: string; totalCents: number }
  | { ok: false; error: string };

type CartItemInput = { productId: string; quantity: number };

/**
 * Aparta todo lo que el cliente puso en el carrito de una sola vez: crea UNA
 * Order con un OrderItem por producto distinto (antes era un click = un
 * apartado de un solo producto). Sin cobro: queda en RESERVED con fecha
 * límite de recogida. El stock de cada producto se descuenta de forma
 * condicional, dentro de una sola transacción, para que dos pedidos
 * simultáneos no dejen el inventario en negativo ni se apruebe un pedido a
 * medias si un producto se quedó sin stock justo antes.
 */
export async function placeOrder(
  _prev: PlaceOrderResult | null,
  formData: FormData,
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/catalogo");
  }
  const userId = session.user.id;
  const t = await getSiteTexts();

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { ok: false, error: t["catalogo.error.invalid_product"] };
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: t["catalogo.error.invalid_product"] };
  }

  const byProduct = new Map<string, number>();
  for (const raw of rawItems) {
    if (
      typeof raw !== "object" ||
      raw === null ||
      typeof (raw as Partial<CartItemInput>).productId !== "string" ||
      typeof (raw as Partial<CartItemInput>).quantity !== "number"
    ) {
      return { ok: false, error: t["catalogo.error.invalid_product"] };
    }
    const { productId, quantity: rawQuantity } = raw as CartItemInput;
    if (!productId || !Number.isFinite(rawQuantity) || rawQuantity <= 0) {
      return { ok: false, error: t["catalogo.error.invalid_product"] };
    }
    const quantity = Math.min(MAX_QUANTITY_PER_ITEM, Math.round(rawQuantity * 100) / 100);
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + quantity);
  }

  if (byProduct.size > MAX_DISTINCT_PRODUCTS_PER_ORDER) {
    return {
      ok: false,
      error: `${t["catalogo.error.too_many_products_prefix"]} ${MAX_DISTINCT_PRODUCTS_PER_ORDER} ${t["catalogo.error.too_many_products_suffix"]}`,
    };
  }

  const pickupSlot = String(formData.get("pickupSlot") ?? "");

  const productIds = [...byProduct.keys()];
  const [activeReservations, products] = await Promise.all([
    prisma.order.count({ where: { userId, status: "RESERVED", pickupBy: { gt: new Date() } } }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { pickupPoint: { select: { pickupDay: true } } },
    }),
  ]);

  // El día de recogida lo define el punto de recogida, no un valor fijo. El
  // carrito solo puede traer productos de una misma feria (la UI ya separa
  // el catálogo por feria), así que si los productos del carrito terminan
  // apuntando a más de un día distinto, algo no cuadra y se rechaza en vez
  // de adivinar cuál usar.
  const pickupDays = new Set(
    products.map((p) => p.pickupPoint?.pickupDay).filter((d): d is number => d != null),
  );
  if (pickupDays.size !== 1) {
    return { ok: false, error: t["catalogo.error.invalid_product"] };
  }
  const pickupDay = [...pickupDays][0];

  const pickupBy = resolvePickupDeadline(pickupDay, pickupSlot);
  if (!pickupBy) {
    return { ok: false, error: t["catalogo.error.invalid_slot"] };
  }
  if (activeReservations >= MAX_ACTIVE_RESERVATIONS_PER_USER) {
    return {
      ok: false,
      error: `${t["catalogo.error.too_many_active_prefix"]} ${MAX_ACTIVE_RESERVATIONS_PER_USER} ${t["catalogo.error.too_many_active_suffix"]}`,
    };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const [productId, quantity] of byProduct) {
    const product = productMap.get(productId);
    if (!product || !product.isActive) {
      return { ok: false, error: t["catalogo.error.product_unavailable"] };
    }
    if (product.unit === "UNIDAD" && !Number.isInteger(quantity)) {
      return { ok: false, error: t["catalogo.error.invalid_product"] };
    }
    if (product.quantity < quantity) {
      return {
        ok: false,
        error: `${product.name}: ${t["catalogo.error.insufficient_stock_prefix"]} ${product.quantity} ${t["catalogo.error.insufficient_stock_suffix"]}`,
      };
    }
  }

  const subtotalCents = [...byProduct].reduce(
    (sum, [productId, quantity]) => sum + quantity * productMap.get(productId)!.discountPriceCents,
    0,
  );
  if (subtotalCents < MIN_ORDER_CENTS) {
    return { ok: false, error: t["catalogo.error.below_minimum"] };
  }

  // Si todos los productos del carrito son del mismo Business, se guarda esa
  // referencia; si el carrito mezcla varios (o ninguno tiene Business), se
  // deja null en vez de atribuirle el pedido entero a uno solo.
  const businessIds = new Set(
    productIds.map((id) => productMap.get(id)!.businessId).filter((id): id is string => Boolean(id)),
  );
  const businessId = businessIds.size === 1 ? [...businessIds][0] : null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const [productId, quantity] of byProduct) {
        const claimed = await tx.product.updateMany({
          where: { id: productId, isActive: true, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (claimed.count === 0) throw new Error("stock");
      }

      return tx.order.create({
        data: {
          userId,
          businessId,
          pickupBy,
          items: {
            create: [...byProduct].map(([productId, quantity]) => ({
              productId,
              quantity,
              unitPriceCents: productMap.get(productId)!.discountPriceCents,
            })),
          },
        },
        include: { items: true },
      });
    });

    const totalCents = Math.round(
      order.items.reduce((sum, it) => sum + it.quantity * it.unitPriceCents, 0),
    );

    revalidatePath("/catalogo");
    revalidatePath("/mis-apartados");
    return { ok: true, orderId: order.id, pickupBy: pickupBy.toISOString(), totalCents };
  } catch {
    return { ok: false, error: t["catalogo.error.generic"] };
  }
}
