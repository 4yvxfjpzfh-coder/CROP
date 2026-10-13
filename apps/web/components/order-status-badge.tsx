const BADGE_STYLES: Record<string, string> = {
  RESERVED: "bg-gold text-olive",
  PICKED_UP: "bg-emerald text-cream",
  CANCELLED: "bg-sienna text-cream",
  EXPIRED: "bg-cream-200 text-stone",
};

const CARD_STYLES: Record<string, string> = {
  RESERVED: "border-gold/40 bg-gold/5",
  PICKED_UP: "border-emerald/40 bg-emerald/5",
  CANCELLED: "border-sienna/30 bg-sienna/5",
  EXPIRED: "border-cream-200 bg-cream-200/30",
};

/** Insignia de color por estado de apartado — mismo look en los 3 paneles (cliente, agricultor, admin). */
export function OrderStatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={
        "inline-block shrink-0 rounded-full px-2.5 py-0.5 font-[family-name:var(--font-form)] text-xs font-medium " +
        (BADGE_STYLES[status] ?? BADGE_STYLES.EXPIRED)
      }
    >
      {label}
    </span>
  );
}

/** Tarjeta con borde/fondo tintado según el estado, para que la lista de apartados se distinga a simple vista. */
export function orderCardClass(status: string): string {
  return "rounded-lg border p-4 " + (CARD_STYLES[status] ?? CARD_STYLES.EXPIRED);
}

/**
 * Insignia de cómo se paga (o se pagó) un pedido -- separada de
 * OrderStatusBadge (que es sobre si se recogió o venció) porque son dos ejes
 * independientes: un pedido puede estar RESERVED y ya pagado con PayPal, o
 * PICKED_UP y pagado en efectivo. Mismo look en los 3 paneles.
 */
export function PaymentBadge({
  paymentStatus,
  texts: t,
}: {
  paymentStatus: "NONE" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  texts: Record<string, string>;
}) {
  if (paymentStatus === "PAID") {
    return (
      <span className="inline-block shrink-0 rounded-full bg-emerald/15 px-2.5 py-0.5 font-[family-name:var(--font-form)] text-xs font-medium text-emerald">
        ✓ {t["pago.estado.pagado_paypal"] ?? "Pagado con PayPal"}
      </span>
    );
  }
  if (paymentStatus === "PENDING") {
    return (
      <span className="inline-block shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 font-[family-name:var(--font-form)] text-xs font-medium text-gold-text">
        {t["pago.estado.pendiente_paypal"] ?? "Pago pendiente"}
      </span>
    );
  }
  // NONE o FAILED: para el agricultor/admin, en los dos casos se cobra en
  // efectivo al recoger -- un pago de PayPal fallido no deja al cliente sin
  // forma de pagar, solo vuelve a la opción de siempre.
  return (
    <span className="inline-block shrink-0 rounded-full bg-cream-200 px-2.5 py-0.5 font-[family-name:var(--font-form)] text-xs font-medium text-stone">
      {t["pago.estado.efectivo"] ?? "Paga al recoger"}
    </span>
  );
}
