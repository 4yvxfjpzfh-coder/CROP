import "server-only";

/**
 * Pagos en línea con PayPal — cobro centralizado a una sola cuenta de Crop
 * (no reparte a cada agricultor; eso necesitaría que Crop fuera aprobado
 * como marketplace por PayPal, algo que no está confirmado para Costa Rica).
 * El admin liquida con cada agricultor aparte, igual que ya hace con el
 * efectivo — ver la columna "Pago" de la hoja de feria.
 *
 * PayPal no acepta colones (CRC) como moneda de cobro, así que todo se cobra
 * en USD, convertido con el tipo de cambio que el admin edita en
 * /admin/settings (SiteSettings.usdExchangeRate). El monto SIEMPRE se calcula
 * acá, del lado del servidor, a partir de lo que hay en la base de datos —
 * nunca se confía en un total que mande el navegador.
 *
 * Credenciales: developer.paypal.com → Apps & Credentials → crear una app.
 * Empezar en modo Sandbox (PAYPAL_ENV=sandbox, el default) y recién al final
 * cambiar a Live con credenciales reales. Ver apps/web/.env.example.
 */

export function isPayPalConfigured(): boolean {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;
}

function isLive(): boolean {
  return (process.env.PAYPAL_ENV ?? "sandbox").trim().toLowerCase() === "live";
}

function apiBase(): string {
  return isLive() ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

// Cache en memoria del access token dentro de la misma instancia del
// servidor (ahorra una llamada de más cuando llegan varias peticiones
// seguidas a la misma instancia tibia). No pasa nada si se pierde al
// reiniciar: se vuelve a pedir solo.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal no está configurado (falta PAYPAL_CLIENT_ID/SECRET)");

  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal OAuth falló: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

export type CreatePayPalOrderResult = { ok: true; paypalOrderId: string } | { ok: false; error: string };

/**
 * Crea la orden del lado de PayPal. `amountUsd` ya viene calculado por quien
 * llama (siempre a partir del total real guardado en la base, nunca de lo
 * que mande el navegador). `customId` es nuestro Order.id — PayPal lo
 * devuelve tal cual en el webhook, así el webhook puede encontrar el pedido
 * sin necesitar una tabla aparte de mapeo.
 */
export async function createPayPalOrder(opts: {
  customId: string;
  amountUsd: string; // "12.34", ya redondeado a 2 decimales
  description: string;
}): Promise<CreatePayPalOrderResult> {
  try {
    const res = await paypalFetch("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: opts.customId,
            description: opts.description.slice(0, 127),
            amount: { currency_code: "USD", value: opts.amountUsd },
          },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.id) {
      return { ok: false, error: data?.message ?? `PayPal respondió ${res.status}` };
    }
    return { ok: true, paypalOrderId: data.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error de red con PayPal" };
  }
}

export type CapturePayPalOrderResult =
  | { ok: true; status: "COMPLETED"; captureId: string; customId: string | null; amountUsd: string }
  | { ok: true; status: "PENDING"; captureId: string | null; customId: string | null; amountUsd: string }
  | { ok: false; error: string };

/** Captura (cobra de verdad) una orden que el comprador ya aprobó en el popup de PayPal. */
export async function capturePayPalOrder(paypalOrderId: string): Promise<CapturePayPalOrderResult> {
  try {
    const res = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.message ?? `PayPal respondió ${res.status}` };

    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const customId: string | null = unit?.custom_id ?? capture?.custom_id ?? null;
    const amountUsd: string = capture?.amount?.value ?? "0";
    const status: string = capture?.status ?? data.status;

    if (status === "COMPLETED") {
      return { ok: true, status: "COMPLETED", captureId: capture.id as string, customId, amountUsd };
    }
    if (status === "PENDING") {
      return { ok: true, status: "PENDING", captureId: capture?.id ?? null, customId, amountUsd };
    }
    return { ok: false, error: `Estado inesperado de PayPal: ${status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error de red con PayPal" };
  }
}

/**
 * Verifica que un webhook realmente venga de PayPal (y no de cualquiera que
 * le pegue a la URL). Nunca se actualiza un pedido a PAID sin pasar por acá.
 * Necesita PAYPAL_WEBHOOK_ID (se obtiene al crear el webhook en el dashboard
 * de PayPal, apuntando a /api/paypal/webhook).
 */
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return false;
  }

  try {
    const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: body,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
