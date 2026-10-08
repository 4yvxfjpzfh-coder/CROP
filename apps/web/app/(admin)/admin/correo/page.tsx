import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { prisma } from "@crop/prisma";
import { isAutoTranslateConfigured } from "@/lib/i18n";
import { LaunchEmailForm } from "./form";
import { launchEmailHtml, siteUrl } from "@/lib/marketing-email";

export const dynamic = "force-dynamic";

/**
 * Envío del correo de lanzamiento. Deliberadamente manual y con prueba en
 * seco: mandar a toda la base es irreversible, así que primero se ve a cuánta
 * gente le llegaría y se manda una prueba a una dirección propia.
 */
export default async function CorreoPage() {
  await requireAdmin("redirect");
  const t = await getSiteTexts();

  const [total, conCorreo, dadosDeBaja] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { email: { not: null }, isActive: true } }),
    prisma.user.count({ where: { marketingOptOutAt: { not: null } } }),
  ]);
  const destinatarios = Math.max(0, conCorreo - dadosDeBaja);
  const configurado = !!process.env.RESEND_API_KEY;

  const preview = launchEmailHtml({
    name: "Ana",
    brand: t["brand.name"],
    url: siteUrl(),
    unsubscribe: `${siteUrl()}/baja?token=ejemplo`,
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">Correo de lanzamiento</h1>
      <p className="mb-6 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Se manda una sola vez a quien tenga cuenta con correo y no se haya dado de baja. Cada correo lleva su
        propio enlace para darse de baja de un clic.
      </p>

      {!configurado && (
        <p className="mb-6 border-l-4 border-sienna bg-cream-200/60 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
          Falta <code>RESEND_API_KEY</code>: no se va a mandar nada. La prueba en seco igual funciona.
        </p>
      )}

      <dl className="mb-6 grid max-w-lg grid-cols-3 gap-4 font-[family-name:var(--font-form)]">
        {[
          ["Cuentas", total],
          ["Con correo", conCorreo],
          ["Dados de baja", dadosDeBaja],
        ].map(([label, n]) => (
          <div key={String(label)}>
            <dt className="text-xs uppercase tracking-wide text-stone">{label}</dt>
            <dd className="text-2xl text-olive">{n}</dd>
          </div>
        ))}
      </dl>

      <p className="mb-6 font-[family-name:var(--font-form)] text-sm text-olive">
        Le llegaría a <strong>{destinatarios}</strong> persona{destinatarios === 1 ? "" : "s"}.
      </p>

      <LaunchEmailForm destinatarios={destinatarios} configurado={configurado} />

      <h2 className="mt-10 mb-3 font-[family-name:var(--font-display)] text-xl text-olive">Vista previa</h2>
      <iframe
        title="Vista previa del correo"
        srcDoc={preview}
        className="h-[620px] w-full max-w-xl border border-cream-200 bg-white"
      />
      {isAutoTranslateConfigured() ? null : (
        <p className="mt-3 max-w-xl font-[family-name:var(--font-form)] text-xs text-stone">
          El correo se manda en español. Traducirlo al idioma de cada persona necesitaría la API key de traducción.
        </p>
      )}
    </section>
  );
}
