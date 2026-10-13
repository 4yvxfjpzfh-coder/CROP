"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// El SDK de PayPal no trae tipos propios acá; se carga como script suelto
// (ver loadSdk más abajo), así que se declara el mínimo que se usa.
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (el: HTMLElement) => void };
    };
  }
}

let sdkPromise: Promise<void> | null = null;

/** Carga el script de PayPal una sola vez, aunque haya varios botones en la misma página. */
function loadSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Botón "Pagar con PayPal" para un pedido ya apartado (RESERVED, sin pagar).
 * Si no hay NEXT_PUBLIC_PAYPAL_CLIENT_ID configurado, no se dibuja nada: el
 * pago en efectivo/SINPE al recoger sigue siendo la opción normal.
 */
export function PayPalButton({
  orderId,
  amountColonesCents,
  usdExchangeRate,
  texts: t,
  onPaid,
}: {
  orderId: string;
  amountColonesCents: number;
  usdExchangeRate: number;
  texts: Record<string, string>;
  onPaid?: () => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "paid" | "pending" | "cancelled" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const approxUsd = (Math.ceil((amountColonesCents / 100 / usdExchangeRate) * 100) / 100).toFixed(2);

  useEffect(() => {
    if (!clientId || rendered.current || !containerRef.current) return;
    rendered.current = true;

    loadSdk(clientId)
      .then(() => {
        if (!window.paypal || !containerRef.current) return;
        window.paypal
          .Buttons({
            style: { layout: "horizontal", color: "black", shape: "pill", label: "pay", height: 40 },
            createOrder: async () => {
              setStatus("idle");
              setErrorMsg("");
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
              });
              const data = await res.json();
              if (!data.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
              return data.paypalOrderId;
            },
            onApprove: async (data: { orderID: string }) => {
              const res = await fetch("/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, paypalOrderId: data.orderID }),
              });
              const result = await res.json();
              if (!result.ok) {
                setStatus("error");
                setErrorMsg(result.error ?? "No se pudo confirmar el pago");
                return;
              }
              setStatus(result.status === "PAID" ? "paid" : "pending");
              onPaid?.();
              router.refresh();
            },
            onCancel: () => setStatus("cancelled"),
            onError: () => {
              setStatus("error");
              setErrorMsg(t["pago.paypal.error_generico"] ?? "Hubo un problema con PayPal");
            },
          })
          .render(containerRef.current);
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg(t["pago.paypal.error_generico"] ?? "Hubo un problema con PayPal");
      });
  }, [clientId, orderId, onPaid, router, t]);

  if (!clientId) return null;

  if (status === "paid") {
    return (
      <p className="font-[family-name:var(--font-form)] text-sm text-emerald">
        {t["pago.paypal.pagado"] ?? "¡Pagado! Gracias."}
      </p>
    );
  }
  if (status === "pending") {
    return (
      <p className="font-[family-name:var(--font-form)] text-sm text-gold-text">
        {t["pago.paypal.pendiente"] ?? "Tu pago está en proceso, te avisamos cuando se confirme."}
      </p>
    );
  }

  return (
    <div className="max-w-xs">
      <p className="mb-0.5 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.paypal.explicacion"] ?? "Opcional: pagá ahora en línea con PayPal, se cobra en dólares:"}{" "}
        <span className="font-medium text-olive">≈ ${approxUsd} USD</span>
      </p>
      <p className="mb-1.5 font-[family-name:var(--font-form)] text-xs text-stone">
        {t["pago.paypal.o_efectivo"] ?? "Si no pagás ahora, pagás en efectivo o SINPE al recoger."}
      </p>
      <div ref={containerRef} />
      {status === "cancelled" && (
        <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-stone">
          {t["pago.paypal.cancelado"] ?? "Pago cancelado. Podés intentar de nuevo o pagar al recoger."}
        </p>
      )}
      {status === "error" && (
        <p className="mt-1 font-[family-name:var(--font-form)] text-xs text-sienna">{errorMsg}</p>
      )}
    </div>
  );
}
