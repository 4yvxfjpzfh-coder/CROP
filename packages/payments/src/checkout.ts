import { stripe } from "./index";

export async function createCheckoutSession(params: {
  amountCents: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  productName: string;
  orderId: string;
}) {
  const { amountCents, currency = "usd", successUrl, cancelUrl, productName, orderId } = params;

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: productName },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId,
    },
  });
}




