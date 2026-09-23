import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { colones } from "../products/types";
import { formatPickupDeadline } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { OrderStatusBadge, orderCardClass } from "@/components/order-status-badge";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  RESERVED: "Apartado",
  PICKED_UP: "Recogido",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export default async function AdminOrdersPage() {
  await requireAdmin("redirect");

  // Cancelados y vencidos no se muestran acá — siguen en la base, solo se
  // sacan de esta lista para no acumular ruido.
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ status: "PICKED_UP" }, { status: "RESERVED", pickupBy: { gte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
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
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Apartados
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Apartados activos y recogidos, en una carpeta por cliente. Los
        cancelados o vencidos no se muestran acá.
      </p>

      {customerGroups.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          Todavía no hay apartados.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {customerGroups.map(([userId, group]) => (
            <details key={userId} open className="border border-cream-200">
              <summary className="cursor-pointer bg-cream-200/40 px-4 py-3 font-[family-name:var(--font-form)] text-sm font-medium text-olive">
                Cliente #{group.customerNumber} — {group.label} ({group.orders.length})
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
                        {" · creado "}
                        {formatPickupDeadline(order.createdAt)}
                        {order.status === "RESERVED" && !expired
                          ? ` · vence ${formatPickupDeadline(order.pickupBy)}`
                          : ""}
                      </div>
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
