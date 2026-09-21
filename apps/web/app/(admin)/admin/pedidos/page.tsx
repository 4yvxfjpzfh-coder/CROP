import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { colones } from "../products/types";
import { formatPickupDeadline } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  RESERVED: "Apartado",
  PICKED_UP: "Recogido",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export default async function AdminOrdersPage() {
  await requireAdmin("redirect");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, pickupPoint: { select: { name: true } } } },
        },
      },
    },
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Apartados
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Todos los apartados de todos los clientes, más recientes primero.
      </p>

      {orders.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          Todavía no hay apartados.
        </p>
      ) : (
        <ul className="divide-y divide-cream-200 border-y border-cream-200">
          {orders.map((order) => {
            const expired =
              order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
            return (
              <li key={order.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-[family-name:var(--font-form)] text-sm text-olive">
                    {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")}
                  </span>
                  <span className="shrink-0 font-[family-name:var(--font-form)] text-xs text-stone">
                    {expired ? "Vencido" : statusLabel[order.status] ?? order.status}
                  </span>
                </div>
                <div className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
                  {order.user.name ?? order.user.email ?? "Cliente"} ·{" "}
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
      )}
    </section>
  );
}
