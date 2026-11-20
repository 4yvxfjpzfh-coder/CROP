"use client";

import { useState } from "react";

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

// Botón de copiar al portapapeles: para que el cliente no teclee el número ni
// el monto, solo copie y pegue en la app del banco. navigator.clipboard puede
// no estar disponible (contexto no seguro, permisos): se ignora el error y el
// número/monto igual quedan visibles al lado para copiar a mano.
function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // El portapapeles puede fallar; no rompe el flujo.
        }
      }}
      className="shrink-0 rounded border border-gold/50 bg-white px-2 py-0.5 font-[family-name:var(--font-form)] text-[11px] font-medium text-olive hover:bg-gold/10"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

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
  const copiar = t["pago.sinpe.copiar"] ?? "Copiar";
  const copiado = t["pago.sinpe.copiado"] ?? "¡Copiado!";
  const copiarMonto = t["pago.sinpe.copiar_monto"] ?? "Copiar monto";
  // El monto a copiar va sin símbolo ni separadores: solo los números, para
  // pegarlo directo en el campo de monto del banco.
  const amountPlain = String(Math.round(amountColonesCents / 100));
  return (
    <div className="max-w-xs rounded-md border border-gold bg-gold/10 p-3">
      <p className="font-[family-name:var(--font-form)] text-sm font-medium text-olive">
        {t["pago.sinpe.titulo"] ?? "Pagá por SINPE Móvil"}
      </p>
      <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.sinpe.instruccion"] ?? "Transferí el total por SINPE Móvil a este número:"}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-olive">
          {SINPE_NUMBER}
        </p>
        <CopyButton value={SINPE_NUMBER} label={copiar} copiedLabel={copiado} />
      </div>

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

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-form)] text-sm text-olive">
          {t["catalogo.cart.total_prefix"] ?? "Total:"}{" "}
          <span className="font-semibold text-gold-text">{colones(amountColonesCents)}</span>
        </p>
        <CopyButton value={amountPlain} label={copiarMonto} copiedLabel={copiado} />
      </div>

      <p className="mt-2 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.sinpe.o_efectivo"] ?? "También podés pagar en efectivo al recoger."}
      </p>
    </div>
  );
}
