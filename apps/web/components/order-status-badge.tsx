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
