import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Respaldo independiente de /api/paypal/capture: PayPal manda estos eventos
 * sin depender de que el navegador del comprador siga abierto o tenga buena
 * conexión. Se configura en el dashboard de PayPal (Apps & Credentials → la
 * app → Add Webhook) apuntando a esta URL, eventos PAYMENT.CAPTURE.*.
 *
 * Nunca se marca un pedido como pagado sin antes verificar la firma: sin
 * eso, cualquiera podría mandarle un POST a esta URL fingiendo un pago.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  const verified = await verifyWebhookSignature(request.headers, rawBody);
  if (!verified) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  let event: {
    event_type?: string;
    resource?: { id?: string; custom_id?: string; status?: string };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const orderId = event.resource?.custom_id;
  const captureId = event.resource?.id;
  if (!orderId) {
    // Eventos que no traen nuestro Order.id (ej. de otra integración en la
    // misma cuenta de PayPal) se reconocen sin hacer nada, no es un error.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ ok: true, skipped: true });

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED": {
      // Idempotente: una notificación duplicada (PayPal reintenta si no
      // respondemos 200 a tiempo) no debe volver a escribir ni romper nada.
      if (order.paymentStatus === "PAID") break;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: "PAYPAL",
          paymentStatus: "PAID",
          paypalCaptureId: captureId ?? order.paypalCaptureId,
          paidAt: order.paidAt ?? new Date(),
        },
      });
      revalidatePath("/mis-apartados");
      revalidatePath("/admin/pedidos");
      break;
    }
    case "PAYMENT.CAPTURE.PENDING": {
      if (order.paymentStatus === "PAID") break;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentMethod: "PAYPAL", paymentStatus: "PENDING" },
      });
      break;
    }
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED": {
      if (order.paymentStatus === "PAID") break; // ya se cobró por otra vía, no pisar
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
      break;
    }
    case "PAYMENT.CAPTURE.REFUNDED": {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } });
      revalidatePath("/mis-apartados");
      revalidatePath("/admin/pedidos");
      break;
    }
    default:
      break; // otros eventos de la cuenta no nos interesan
  }

  return NextResponse.json({ ok: true });
}
