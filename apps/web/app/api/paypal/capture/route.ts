import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Segundo paso: el comprador ya aprobó el pago en el popup de PayPal, así
 * que se captura (se cobra) de verdad y recién acá se marca el pedido como
 * pagado. El webhook (/api/paypal/webhook) hace lo mismo de forma
 * independiente como respaldo, por si la respuesta de este endpoint nunca
 * le llega al navegador (ej. se cerró la pestaña justo después de aprobar).
 */
export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ ok: false, error: "PayPal no está configurado" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  let orderId: string, paypalOrderId: string;
  try {
    const body = await request.json();
    orderId = String(body.orderId ?? "");
    paypalOrderId = String(body.paypalOrderId ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }
  if (!orderId || !paypalOrderId) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
  }

  // Idempotente: si ya quedó pagado (por ejemplo porque el webhook se
  // adelantó) no se vuelve a capturar ni se trata como error.
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, status: "PAID" });
  }

  const result = await capturePayPalOrder(paypalOrderId);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });

  // Verificación extra: el pedido que PayPal dice haber cobrado tiene que
  // ser este mismo (custom_id = nuestro Order.id), no uno ajeno.
  if (result.customId && result.customId !== order.id) {
    return NextResponse.json({ ok: false, error: "El pago no corresponde a este pedido" }, { status: 409 });
  }

  if (result.status === "COMPLETED") {
    const settings = await getSiteSettings();
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "PAYPAL",
        paymentStatus: "PAID",
        paypalOrderId,
        paypalCaptureId: result.captureId,
        fxRateUsed: settings.usdExchangeRate,
        paidAt: new Date(),
      },
    });
    revalidatePath("/mis-apartados");
    revalidatePath("/admin/pedidos");
    return NextResponse.json({ ok: true, status: "PAID" });
  }

  // PENDING (ej. un método de pago que liquida en unos días, no al toque).
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentMethod: "PAYPAL", paymentStatus: "PENDING", paypalOrderId },
  });
  revalidatePath("/mis-apartados");
  revalidatePath("/admin/pedidos");
  return NextResponse.json({ ok: true, status: "PENDING" });
}
