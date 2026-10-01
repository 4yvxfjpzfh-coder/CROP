import { prisma } from "@crop/prisma";
import { colones } from "@/app/(admin)/admin/products/types";
import { crDayRangeUtc, PICKUP_GRACE_HOURS } from "@/lib/pickup-schedule";
import { PrintButton } from "./print-button";

type OrderRow = Awaited<ReturnType<typeof loadOrders>>[number];

// Semana de lunes a domingo (hora CR) que contiene `date`.
function weekRange(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  const monday = new Date(Date.UTC(y, m - 1, d - ((dow + 6) % 7)));
  const sunday = new Date(monday.getTime() + 6 * 24 * 3600 * 1000);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const { start } = crDayRangeUtc(iso(monday));
  const { end } = crDayRangeUtc(iso(sunday));
  return { start, end, mondayIso: iso(monday), sundayIso: iso(sunday) };
}

// Con farmerId, solo pedidos que incluyen productos de ese agricultor, y
// solo sus items (el agricultor no ve lo que se le compró a otros).
async function loadOrders(pickupPointId: string, date: string, farmerId?: string) {
  const { start, end } = weekRange(date);
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["RESERVED", "PICKED_UP"] },
      pickupBy: { gte: start, lt: end },
      items: { some: { product: { pickupPointId, ...(farmerId ? { farmerId } : {}) } } },
    },
    orderBy: { pickupBy: "asc" },
    include: {
      user: { select: { customerNumber: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              providerName: true,
              farmer: { select: { id: true, name: true, email: true, tableNumber: true } },
            },
          },
        },
      },
    },
  });
  if (!farmerId) return orders;
  return orders.map((o) => ({
    ...o,
    items: o.items.filter((i) => i.product.farmer?.id === farmerId),
  }));
}

// Agrupa los items de un pedido por agricultor (o por nombre libre si no
// tiene cuenta vinculada) para la columna de desglose -- un pedido puede
// traer productos de varios agricultores a la vez.
function breakdownByFarmer(order: OrderRow) {
  const groups = new Map<string, { label: string; tableNumber: string | null; cents: number }>();
  for (const item of order.items) {
    const key = item.product.farmer?.id ?? item.product.providerName ?? "sin-agricultor";
    const label = item.product.farmer?.name ?? item.product.providerName ?? "Sin agricultor";
    const tableNumber = item.product.farmer?.tableNumber ?? null;
    const cents = item.quantity * item.unitPriceCents;
    const existing = groups.get(key);
    if (existing) existing.cents += cents;
    else groups.set(key, { label, tableNumber, cents });
  }
  return [...groups.values()];
}

export async function FeriaSheet({
  pickupPointId,
  date,
  farmerId,
}: {
  pickupPointId?: string;
  date?: string;
  farmerId?: string;
}) {
  const pickupPoints = await prisma.pickupPoint.findMany({ orderBy: { name: "asc" } });
  const selectedPoint = pickupPoints.find((p) => p.id === pickupPointId) ?? null;

  const orders = pickupPointId && date ? await loadOrders(pickupPointId, date, farmerId) : null;

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive print:hidden">
        Hoja de feria
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone print:hidden">
        Elegí la feria y cualquier día de la semana (se toma de lunes a
        domingo) para armar la hoja. Después tocá
        &quot;Imprimir&quot; — el navegador se encarga del resto.
      </p>

      <form method="get" className="mb-8 flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className="mb-1 block font-[family-name:var(--font-form)] text-sm text-stone" htmlFor="pickupPointId">
            Feria
          </label>
          <select
            id="pickupPointId"
            name="pickupPointId"
            defaultValue={pickupPointId ?? ""}
            required
            className="border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive"
          >
            <option value="" disabled>
              Elegí una feria
            </option>
            {pickupPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-[family-name:var(--font-form)] text-sm text-stone" htmlFor="date">
            Semana (cualquier día)
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={date ?? ""}
            required
            className="border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive"
          />
        </div>
        <button
          type="submit"
          className="border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200"
        >
          Ver hoja
        </button>
        {orders && orders.length > 0 && <PrintButton label="Imprimir" />}
      </form>

      {orders && (
        <>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-olive">
            {selectedPoint?.shortName} — semana del {weekRange(date!).mondayIso} al {weekRange(date!).sundayIso}
          </h2>

          {orders.length === 0 ? (
            <p className="font-[family-name:var(--font-form)] text-sm text-stone">
              No hay pedidos para esa feria en esa semana.
            </p>
          ) : (
            <table className="w-full border-collapse font-[family-name:var(--font-form)] text-sm">
              <thead>
                <tr className="border-b-2 border-olive text-left">
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Mesa</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Desglose por agricultor</th>
                  <th className="py-2 pr-3">Recogido</th>
                  <th className="py-2 pr-3">Entregado</th>
                  <th className="py-2 pr-3">Hora de entrega</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const breakdown = breakdownByFarmer(order);
                  const totalCents = order.items.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
                  const scheduled = new Date(order.pickupBy.getTime() - PICKUP_GRACE_HOURS * 3600 * 1000);
                  const scheduledLabel = scheduled.toLocaleString("es-CR", {
                    timeZone: "America/Costa_Rica",
                    weekday: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={order.id} className="border-b border-cream-200 align-top">
                      <td className="py-2 pr-3">
                        #{String(order.user.customerNumber).padStart(3, "0")} {order.user.name ?? order.user.email ?? ""}
                      </td>
                      <td className="py-2 pr-3">
                        {breakdown.map((b, i) => (
                          <div key={i}>{b.tableNumber ?? "—"}</div>
                        ))}
                      </td>
                      <td className="py-2 pr-3 font-medium">{colones(totalCents)}</td>
                      <td className="py-2 pr-3">
                        {breakdown.map((b, i) => (
                          <div key={i}>
                            {b.label}: {colones(b.cents)}
                          </div>
                        ))}
                      </td>
                      <td className="py-2 pr-3 text-center text-base">☐</td>
                      <td className="py-2 pr-3 text-center text-base">
                        {order.status === "PICKED_UP" ? "✓" : "☐"}
                      </td>
                      <td className="py-2 pr-3">{scheduledLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
