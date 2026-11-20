// Pago por SINPE Móvil: reemplaza al botón de PayPal. El cliente transfiere
// el total a este número y el pago se concilia a mano (igual que el pago en
// efectivo al recoger) -- no hay captura automática como tenía PayPal.
const SINPE_NUMBER = "64578227";

const colones = (cents: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);

// Una línea del detalle de pago: cuánto del total le corresponde a cada
// agricultor. El cliente paga todo junto al número de abajo; este detalle es
// para que quede claro (y registrado en el apartado) cuánto es de cada uno,
// así el dueño sabe exacto cuánto girarle después a cada agricultor.
export type SinpeBreakdownLine = { label: string; amountCents: number };

export function SinpePayment({
  amountColonesCents,
  texts: t,
  breakdown,
  feeCents,
}: {
  amountColonesCents: number;
  texts: Record<string, string>;
  breakdown?: SinpeBreakdownLine[];
  feeCents?: number;
}) {
  const showBreakdown = breakdown != null && breakdown.length > 0;
  return (
    <div className="max-w-xs rounded-md border border-gold bg-gold/10 p-3">
      <p className="font-[family-name:var(--font-form)] text-sm font-medium text-olive">
        {t["pago.sinpe.titulo"] ?? "Pagá por SINPE Móvil"}
      </p>
      <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.sinpe.instruccion"] ?? "Transferí el total por SINPE Móvil a este número:"}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wider text-olive">
        {SINPE_NUMBER}
      </p>

      {showBreakdown && (
        <div className="mt-2 border-t border-gold/30 pt-2">
          <p className="font-[family-name:var(--font-form)] text-[11px] font-medium text-stone">
            {t["pago.sinpe.desglose"] ?? "Esto recibe cada agricultor:"}
          </p>
          <ul className="mt-1 space-y-0.5">
            {breakdown!.map((line, i) => (
              <li
                key={i}
                className="flex justify-between gap-3 font-[family-name:var(--font-form)] text-xs text-olive"
              >
                <span>{line.label}</span>
                <span className="tabular-nums">{colones(line.amountCents)}</span>
              </li>
            ))}
            {feeCents != null && feeCents > 0 && (
              <li className="flex justify-between gap-3 font-[family-name:var(--font-form)] text-xs text-stone">
                <span>{t["catalogo.cart.service_fee_prefix"] ?? "Servicio"}</span>
                <span className="tabular-nums">{colones(feeCents)}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      <p className="mt-2 font-[family-name:var(--font-form)] text-sm text-olive">
        {t["catalogo.cart.total_prefix"] ?? "Total:"}{" "}
        <span className="font-semibold text-gold-text">{colones(amountColonesCents)}</span>
      </p>
      <p className="mt-2 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.sinpe.o_efectivo"] ??
          "También podés pagar en efectivo o por SINPE directo al agricultor al recoger."}
      </p>
    </div>
  );
}
