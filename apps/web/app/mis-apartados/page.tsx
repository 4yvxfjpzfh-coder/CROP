import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";
import { formatPickupDeadline } from "@/lib/format";
import { colones } from "../(store)/catalogo/catalog-types";
import { formatQuantity } from "@/lib/units";
import { CancelButton } from "./cancel-button";
import { OrderStatusBadge, orderCardClass } from "@/components/order-status-badge";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["apartados.heading"]} — ${t["brand.name"]}` };
}

export default async function MyReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/mis-apartados");

  const [orders, t] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true, pickupPoint: { select: { name: true } } } },
          },
        },
      },
    }),
    getSiteTexts(),
  ]);

  const statusLabel: Record<string, string> = {
    RESERVED: t["apartados.status_reserved"],
    PICKED_UP: t["apartados.status_picked_up"],
    CANCELLED: t["apartados.status_cancelled"],
    EXPIRED: t["apartados.status_expired"],
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">{t["apartados.heading"]}</h1>
        <Link href="/catalogo" className="text-sm text-neutral-700 underline underline-offset-2">
          {t["nav.ver_catalogo"]}
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600">
          {t["apartados.empty_text"]}{" "}
          <Link href="/catalogo" className="underline underline-offset-2">
            {t["apartados.empty_link"]}
          </Link>
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {orders.map((order) => {
            const pickup = order.items[0]?.product.pickupPoint?.name ?? null;
            const expired =
              order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
            const displayStatus = expired ? "EXPIRED" : order.status;
            return (
              <li key={order.id} className={orderCardClass(displayStatus)}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-neutral-900">
                    {order.items
                      .map((i) => `${formatQuantity(i.quantity, i.product.unit)} de ${i.product.name}`)
                      .join(", ")}
                  </span>
                  <OrderStatusBadge status={displayStatus} label={statusLabel[displayStatus] ?? displayStatus} />
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {colones(
                    order.items.reduce(
                      (s, i) => s + i.unitPriceCents * i.quantity,
                      0,
                    ),
                  )}
                  {pickup ? ` · ${t["apartados.recoge_en_prefix"]} ${pickup}` : ""}
                  {order.status === "RESERVED" && !expired
                    ? ` · ${t["apartados.antes_del_prefix"]} ${formatPickupDeadline(order.pickupBy)}`
                    : ""}
                </div>
                {order.status === "RESERVED" && !expired && (
                  <div className="mt-2">
                    <CancelButton orderId={order.id} texts={t} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
