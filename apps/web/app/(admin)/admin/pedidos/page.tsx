import Link from "next/link";
import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { colones } from "../products/types";
import { formatPickupDeadline } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { OrderStatusBadge, orderCardClass } from "@/components/order-status-badge";
import { markPickedUp } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin("redirect");
  const t = await getSiteTexts();

  const statusLabel: Record<string, string> = {
    RESERVED: t["admin.pedidos.status_reserved"],
    PICKED_UP: t["admin.pedidos.status_picked_up"],
    CANCELLED: t["admin.pedidos.status_cancelled"],
    EXPIRED: t["admin.pedidos.status_expired"],
  };

  // Se muestran todos los RESERVED (con y sin pickupBy en el futuro) para
  // que el admin no pierda visibilidad si el cron todavía no los marcó como
  // EXPIRED. Los PICKED_UP de los últimos 30 días también aparecen.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: "RESERVED" },
        { status: "PICKED_UP", updatedAt: { gte: thirtyDaysAgo } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 250,
    include: {
      user: { select: { id: true, name: true, email: true, customerNumber: true } },
      items: {
        include: {
          product: { select: { name: true, unit: true, pickupPoint: { select: { name: true } } } },
        },
      },
    },
  });

  // Carpeta por cliente: mantiene el orden general (más reciente primero)
  // porque `orders` ya viene ordenado y Map conserva el orden de inserción.
  const groups = new Map<
    string,
    { label: string; customerNumber: number; orders: typeof orders }
  >();
  for (const order of orders) {
    const key = order.user.id;
    if (!groups.has(key)) {
      groups.set(key, {
        label: order.user.name ?? order.user.email ?? "Cliente",
        customerNumber: order.user.customerNumber,
        orders: [],
      });
    }
    groups.get(key)!.orders.push(order);
  }
  const customerGroups = [...groups.entries()];

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-olive">
          {t["admin.pedidos.heading"]}
        </h1>
        <Link
          href="/admin/pedidos/exportar"
          className="border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200"
        >
          {t["admin.pedidos.exportar_link"]}
        </Link>
      </div>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        {t["admin.pedidos.subtext"]}
      </p>

      {customerGroups.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          {t["admin.pedidos.empty"]}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {customerGroups.map(([userId, group]) => (
            <details key={userId} open className="border border-cream-200">
              <summary className="cursor-pointer bg-cream-200/40 px-4 py-3 font-[family-name:var(--font-form)] text-sm font-medium text-olive">
                {t["admin.pedidos.cliente_prefix"]} #{String(group.customerNumber).padStart(3, "0")} — {group.label} ({group.orders.length})
              </summary>
              <ul className="flex flex-col gap-3 p-4">
                {group.orders.map((order) => {
                  const expired =
                    order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
                  const displayStatus = expired ? "EXPIRED" : order.status;
                  return (
                    <li key={order.id} className={orderCardClass(displayStatus)}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-[family-name:var(--font-form)] text-sm text-olive">
                          {order.items
                            .map((i) => `${formatQuantity(i.quantity, i.product.unit)} de ${i.product.name}`)
                            .join(", ")}
                        </span>
                        <OrderStatusBadge status={displayStatus} label={statusLabel[displayStatus] ?? displayStatus} />
                      </div>
                      <div className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
                        {colones(order.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0))}
                        {order.items[0]?.product.pickupPoint?.name
                          ? ` · ${order.items[0].product.pickupPoint.name}`
                          : ""}
                        {" · "}
                        {t["admin.pedidos.creado_prefix"]} {formatPickupDeadline(order.createdAt)}
                        {order.status === "RESERVED" && !expired
                          ? ` · ${t["admin.pedidos.vence_prefix"]} ${formatPickupDeadline(order.pickupBy)}`
                          : ""}
                      </div>
                      {order.status === "RESERVED" && !expired && (
                        <form action={markPickedUp} className="mt-2">
                          <input type="hidden" name="orderId" value={order.id} />
                          <button
                            type="submit"
                            className="bg-olive px-3 py-1.5 font-[family-name:var(--font-form)] text-xs text-cream hover:opacity-90"
                          >
                            {t["admin.pedidos.marcar_entregado"]}
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
