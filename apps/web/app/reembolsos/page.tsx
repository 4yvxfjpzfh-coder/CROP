import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cancelaciones y Reembolsos — Crop",
};

// TODO(legal): reemplazar este placeholder con el texto legal final, revisado
// contra la Ley de Promoción de la Competencia y Defensa Efectiva del
// Consumidor (Costa Rica) y demás normativa local aplicable.
export default function ReembolsosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Política de Cancelaciones y Reembolsos
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Borrador — pendiente de revisión legal. Última actualización: —
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            1. No hay pagos en línea
          </h2>
          <p>
            Crop no procesa pagos ni cobros a través de la plataforma. Un
            &quot;apartado&quot; es una reserva de producto, no una compra. Si
            corresponde algún pago, se realiza directamente con el agricultor
            al momento de recoger el producto en la feria.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            2. Cancelar un apartado
          </h2>
          <p>
            Podés cancelar un apartado vigente en cualquier momento antes de
            la fecha límite de recogida, desde{" "}
            <a href="/mis-apartados" className="underline underline-offset-2">
              Mis apartados
            </a>
            . Las unidades vuelven a estar disponibles de inmediato para otras
            personas.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            3. Apartados vencidos
          </h2>
          <p>
            Si no recogés el producto antes de la fecha límite, el apartado se
            libera automáticamente y las unidades vuelven al inventario
            disponible. No hay ninguna penalización por esto.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            4. Problemas con un producto
          </h2>
          <p>
            Como Crop no interviene en el pago ni en la entrega física, un
            reclamo sobre la calidad o el estado de un producto se resuelve
            directamente con el agricultor en el punto de recogida. Si el
            problema es con la plataforma en sí (por ejemplo, un error en la
            información mostrada), escribinos a: [correo pendiente].
          </p>
        </section>
      </div>
    </main>
  );
}
