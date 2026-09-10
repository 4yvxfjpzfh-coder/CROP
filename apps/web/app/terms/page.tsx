import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio — Crop",
};

// TODO(legal): reemplazar este placeholder con el texto legal final.
export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Términos de Servicio
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Borrador — pendiente de revisión legal. Última actualización: —
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-neutral-900">1. Qué es Crop</h2>
          <p>
            Crop es una plataforma para apartar productos de excedente agrícola y
            de rescate de comida. No se realizan pagos en línea: el pago, si
            aplica, ocurre al recoger el producto en el punto de recogida.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            2. Apartados y recogida
          </h2>
          <p>
            Un apartado reserva unidades por un tiempo limitado. Si no se recoge
            antes de la fecha límite, el apartado se libera automáticamente y las
            unidades vuelven a estar disponibles.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">3. Tu cuenta</h2>
          <p>
            Sos responsable de la actividad de tu cuenta. Podés eliminarla en
            cualquier momento desde tu perfil.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            4. Disponibilidad y cambios
          </h2>
          <p>
            El servicio se ofrece &quot;tal cual&quot;. Podemos modificar o
            suspender funciones; los cambios materiales se comunicarán con
            antelación razonable.
          </p>
        </section>
      </div>
    </main>
  );
}
