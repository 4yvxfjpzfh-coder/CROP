import { prisma } from "@crop/prisma";
import { requireFarmer } from "@/lib/farmer-guard";
import { colones } from "../productos/types";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  RESERVED: "Apartado",
  PICKED_UP: "Recogido",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export default async function FarmerOrdersPage() {
  const actor = await requireFarmer("redirect");

  // Pedidos que incluyen al menos un producto de este agricultor. Se muestra
  // solo la info de SUS renglones, no de otros productos que compartan orden.
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { farmerId: actor.id } } } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        where: { product: { farmerId: actor.id } },
        include: { product: { select: { name: true, pickupPoint: { select: { name: true } } } } },
      },
    },
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Pedidos
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Quién apartó tus productos, para que sepas qué preparar cuando pasen a
        recogerlo en la feria.
      </p>

      {orders.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          Todavía no hay apartados de tus productos.
        </p>
      ) : (
        <ul className="divide-y divide-cream-200 border-y border-cream-200">
          {orders.map((order) => {
            const expired =
              order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
            return (
              <li key={order.id} className="py-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-[family-name:var(--font-form)] text-sm text-olive">
                    {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")}
                  </span>
                  <span className="font-[family-name:var(--font-form)] text-xs text-stone">
                    {expired ? "Vencido" : statusLabel[order.status] ?? order.status}
                  </span>
                </div>
                <div className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
                  {order.user.name ?? order.user.email ?? "Cliente"} ·{" "}
                  {colones(order.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0))}
                  {order.items[0]?.product.pickupPoint?.name
                    ? ` · ${order.items[0].product.pickupPoint.name}`
                    : ""}
                  {order.status === "RESERVED" && !expired
                    ? ` · antes del ${order.pickupBy.toLocaleString("es-CR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}`
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
