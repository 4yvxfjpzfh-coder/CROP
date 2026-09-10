import { stripe } from "./index";
import type Stripe from "stripe";

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret) as Stripe.Event;
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: marcar el pedido como pagado usando session.id / session.customer_email
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      // TODO: notificar que el pago falló
      break;
    }
    default:
      // evento no manejado, se puede ignorar
      break;
  }
}
