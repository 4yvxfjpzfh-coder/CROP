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

export function SinpePayment({
  amountColonesCents,
  texts: t,
}: {
  amountColonesCents: number;
  texts: Record<string, string>;
}) {
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
      <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-olive">
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
