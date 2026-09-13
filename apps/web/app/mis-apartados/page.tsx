import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { colones } from "../(store)/catalogo/catalog-types";
import { CancelButton } from "./cancel-button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mis apartados — Crop" };

const statusLabel: Record<string, string> = {
  RESERVED: "Apartado",
  PICKED_UP: "Recogido",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export default async function MyReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/mis-apartados");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true } },
      items: { include: { product: { select: { name: true, pickupPoint: { select: { name: true } } } } } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Mis apartados</h1>
        <Link href="/catalogo" className="text-sm text-neutral-700 underline underline-offset-2">
          Ver catálogo
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600">
          Todavía no apartaste nada.{" "}
          <Link href="/catalogo" className="underline underline-offset-2">
            Explorá el excedente disponible.
          </Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
          {orders.map((order) => {
            const pickup = order.items[0]?.product.pickupPoint?.name ?? null;
            const expired =
              order.status === "RESERVED" && order.pickupBy.getTime() < Date.now();
            return (
              <li key={order.id} className="py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-neutral-900">
                    {order.items
                      .map((i) => `${i.quantity}× ${i.product.name}`)
                      .join(", ")}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {expired ? "Vencido" : statusLabel[order.status] ?? order.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {colones(
                    order.items.reduce(
                      (s, i) => s + i.unitPriceCents * i.quantity,
                      0,
                    ),
                  )}
                  {pickup ? ` · Recogé en ${pickup}` : ""}
                  {order.status === "RESERVED" && !expired
                    ? ` · antes del ${order.pickupBy.toLocaleString("es-CR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}`
                    : ""}
                </div>
                {order.status === "RESERVED" && !expired && (
                  <div className="mt-2">
                    <CancelButton orderId={order.id} />
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
