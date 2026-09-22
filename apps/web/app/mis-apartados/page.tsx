import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";
import { getHomeBackgroundUrl } from "@/lib/site-settings";
import { formatPickupDeadline } from "@/lib/format";
import { colones, SERVICE_FEE_CENTS } from "../(store)/catalogo/catalog-types";
import { formatQuantity } from "@/lib/units";
import { CancelButton } from "./cancel-button";
import { OrderStatusBadge, orderCardClass } from "@/components/order-status-badge";
import { SiteBackground } from "@/components/site-background";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["apartados.heading"]} — ${t["brand.name"]}` };
}

export default async function MyReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/mis-apartados");

  const [orders, t, backgroundUrl] = await Promise.all([
    prisma.order.findMany({
      // Cancelados y vencidos no se muestran acá -- siguen en la base, pero
      // desaparecen de la vista apenas se cancelan o se vence la fecha.
      where: {
        userId: session.user.id,
        OR: [{ status: "PICKED_UP" }, { status: "RESERVED", pickupBy: { gte: new Date() } }],
      },
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
    getHomeBackgroundUrl(),
  ]);

  const statusLabel: Record<string, string> = {
    RESERVED: t["apartados.status_reserved"],
    PICKED_UP: t["apartados.status_picked_up"],
    CANCELLED: t["apartados.status_cancelled"],
    EXPIRED: t["apartados.status_expired"],
  };

  // Un solo total para todos los apartados listados, no uno por uno: la
  // suma de todos los productos de todas las órdenes, más un único cargo
  // por servicio de ₡500 (no uno por cada apartado).
  const grandSubtotal = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
    0,
  );
  const grandTotal = grandSubtotal + SERVICE_FEE_CENTS;

  return (
    <div className="relative min-h-dvh w-full">
      <SiteBackground url={backgroundUrl} />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="inline-block bg-cream px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:opacity-90"
        >
          {t["nav.volver_inicio"]}
        </Link>
        <div className="mt-4 flex items-end justify-between">
          <h1 className="text-2xl font-semibold text-paper">{t["apartados.heading"]}</h1>
          <Link href="/catalogo" className="text-sm text-metal underline underline-offset-2 hover:text-paper">
            {t["nav.ver_catalogo"]}
          </Link>
        </div>

        <div className="mt-8 rounded-lg bg-cream/95 p-6 backdrop-blur-sm">
          {orders.length === 0 ? (
            <p className="text-sm text-stone">
              {t["apartados.empty_text"]}{" "}
              <Link href="/catalogo" className="underline underline-offset-2">
                {t["apartados.empty_link"]}
              </Link>
            </p>
          ) : (
            <>
              <p className="mb-4 border-b border-cream-200 pb-4 text-sm text-olive">
                {t["catalogo.cart.subtotal_prefix"]} {colones(grandSubtotal)}
                {" + "}
                {t["catalogo.cart.service_fee_prefix"]} {colones(SERVICE_FEE_CENTS)}
                {" — "}
                {t["catalogo.cart.total_prefix"]}{" "}
                <span className="font-semibold text-gold-text">{colones(grandTotal)}</span>
              </p>
              <ul className="flex flex-col gap-3">
                {orders.map((order) => {
                  const pickup = order.items[0]?.product.pickupPoint?.name ?? null;
                  const expired =
                    order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
                  const displayStatus = expired ? "EXPIRED" : order.status;
                  const subtotal = order.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
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
                        {colones(subtotal)}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
