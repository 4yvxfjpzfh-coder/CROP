import { NextResponse } from "next/server";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getSiteSettings, colonesCentsToUsdString } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { serviceFeeCents } from "@/app/(store)/catalogo/catalog-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Primer paso del pago con PayPal: crea la orden del lado de PayPal para un
 * pedido que ya existe (ya se apartó, sin pagar). El monto se calcula acá,
 * con lo que hay guardado en la base de datos -- nunca se recibe ni se
 * confía en un total que mande el navegador.
 *
 * A propósito NO se guarda nada en nuestra Order todavía (ni el
 * paypalOrderId ni un estado "pendiente"): si alguien cierra la pestaña acá,
 * el pedido sigue en RESERVED normal y puede vencer como cualquier otro. Lo
 * único que deja rastro en nuestra base es cuando el pago se captura de
 * verdad -- ver /api/paypal/capture.
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

  const subtotalCents = order.items.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
  const totalCents = Math.round(subtotalCents + serviceFeeCents(subtotalCents));

  const [settings, t] = await Promise.all([getSiteSettings(), getSiteTexts()]);
  const amountUsd = colonesCentsToUsdString(totalCents, settings.usdExchangeRate);

  const result = await createPayPalOrder({
    customId: order.id,
    amountUsd,
    description: `${t["brand.name"]} — ${order.id}`,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, paypalOrderId: result.paypalOrderId, amountUsd });
}
