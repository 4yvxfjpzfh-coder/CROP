import { NextResponse } from "next/server";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getSiteSettings, colonesCentsToUsdString } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { serviceFeeCents } from "@/app/(store)/catalogo/catalog-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Nadie debería tardar más que esto en aprobar el pago en el popup de
// PayPal; pasado este tiempo el candado se considera abandonado y se puede
// volver a intentar.
const PENDING_LOCK_MS = 20 * 60 * 1000;

/**
 * Primer paso del pago con PayPal: crea la orden del lado de PayPal para un
 * pedido que ya existe (ya se apartó, sin pagar). El monto se calcula acá,
 * con lo que hay guardado en la base de datos -- nunca se recibe ni se
 * confía en un total que mande el navegador.
 *
 * Antes de crear la orden en PayPal, se reclama un candado atómico
 * (paypalPendingOrderId) en nuestra Order: sin esto, dos pestañas (o un
 * doble clic) podrían generar dos órdenes de PayPal distintas para el mismo
 * pedido, y si las dos se llegan a aprobar y capturar, el cliente paga dos
 * veces de verdad. El candado se libera solo si pasaron más de 20 minutos
 * sin terminar -- así un intento abandonado no deja el pedido trabado.
 */
export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ ok: false, error: "PayPal no está configurado" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  let orderId: string;
  try {
    const body = await request.json();
    orderId = String(body.orderId ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido" }, { status: 400 });
  }
  if (!orderId) return NextResponse.json({ ok: false, error: "Falta el pedido" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
  }
  if (order.status !== "RESERVED" || order.pickupBy.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Este apartado ya no se puede pagar" }, { status: 409 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ ok: false, error: "Este pedido ya está pagado" }, { status: 409 });
  }

  const t = await getSiteTexts();

  // Candado atómico: solo avanza si no hay otro intento en curso, o si el
  // que había quedó viejo (>20 min, se considera abandonado). "claiming" es
  // un valor provisorio -- se reemplaza por el id real de PayPal abajo.
  const staleCutoff = new Date(Date.now() - PENDING_LOCK_MS);
  const claimed = await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { not: "PAID" },
      OR: [{ paypalPendingOrderId: null }, { paypalPendingCreatedAt: { lt: staleCutoff } }],
    },
    data: { paypalPendingOrderId: "claiming", paypalPendingCreatedAt: new Date() },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ ok: false, error: t["pago.paypal.error_concurrente"] }, { status: 409 });
  }

  const subtotalCents = order.items.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
  const totalCents = Math.round(subtotalCents + serviceFeeCents(subtotalCents));

  const settings = await getSiteSettings();
  const amountUsd = colonesCentsToUsdString(totalCents, settings.usdExchangeRate);

  const result = await createPayPalOrder({
    customId: order.id,
    amountUsd,
    description: `${t["brand.name"]} — ${order.id}`,
  });

  if (!result.ok) {
    // No se pudo crear del lado de PayPal: se libera el candado para que se
    // pueda reintentar ya mismo, sin esperar los 20 minutos.
    await prisma.order.update({
      where: { id: order.id },
      data: { paypalPendingOrderId: null, paypalPendingCreatedAt: null },
    });
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paypalPendingOrderId: result.paypalOrderId },
  });
  return NextResponse.json({ ok: true, paypalOrderId: result.paypalOrderId, amountUsd });
}
