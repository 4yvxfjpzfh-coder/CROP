import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Crop",
};

// TODO(legal): reemplazar este placeholder con el texto legal final.
// Debe cubrir, para cumplir con Apple: qué datos se recogen (nombre, correo de
// Apple), para qué se usan, con quién se comparten (nadie), cuánto se conservan,
// y cómo eliminar la cuenta (/perfil).
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Borrador — pendiente de revisión legal. Última actualización: —
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            1. Datos que recopilamos
          </h2>
          <p>
            Cuando iniciás sesión con Apple recibimos tu nombre y tu dirección de
            correo (o el correo privado de reenvío de Apple, si elegís ocultarlo).
            Guardamos también los apartados que hacés en la plataforma.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            2. Uso de los datos
          </h2>
          <p>
            Usamos estos datos únicamente para identificarte, mostrarte tus
            apartados y coordinar la recogida en la feria del agricultor. No
            vendemos ni compartimos tus datos con terceros.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">
            3. Conservación y eliminación
          </h2>
          <p>
            Podés eliminar tu cuenta y tus datos personales en cualquier momento
            desde tu perfil. Al hacerlo borramos tu nombre, correo y credenciales
            de acceso de forma permanente.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-neutral-900">4. Contacto</h2>
          <p>Para consultas sobre privacidad, escribinos a: [correo pendiente].</p>
        </section>
      </div>
    </main>
  );
}
