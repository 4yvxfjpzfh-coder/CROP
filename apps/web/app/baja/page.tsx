import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSiteTexts } from "@/lib/site-text";
import { unsubscribeByToken, resubscribeByToken } from "@/lib/marketing-email";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["baja.heading"]} — ${t["brand.name"]}`, robots: { index: false, follow: false } };
}

/**
 * Darse de baja de los correos de novedades.
 *
 * De un solo clic y sin pedir contraseña: obligar a iniciar sesión para dejar
 * de recibir correos es justo lo que hace que la gente marque el correo como
 * spam. El token del enlace solo sirve para esto.
 */
async function volverASuscribirse(form: FormData) {
  "use server";
  await resubscribeByToken(String(form.get("token") ?? ""));
  revalidatePath("/baja");
}

export default async function BajaPage({ searchParams }: { searchParams: Promise<{ token?: string; vuelto?: string }> }) {
  const [t, { token, vuelto }] = await Promise.all([getSiteTexts(), searchParams]);
  const result = token ? await unsubscribeByToken(token) : { ok: false };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-20 text-neutral-800">
      <h1 className="text-2xl font-semibold text-neutral-900">{t["baja.heading"]}</h1>

      {!token ? (
        <p className="mt-4 text-sm leading-relaxed">{t["baja.sin_token"]}</p>
      ) : vuelto ? (
        <p className="mt-4 text-sm leading-relaxed">{t["baja.resuscrito"]}</p>
      ) : result.ok ? (
        <>
          <p className="mt-4 text-sm leading-relaxed">
            {t["baja.listo"]}
            {result.email ? <> <strong>{result.email}</strong></> : null}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">{t["baja.sigue_transaccional"]}</p>
          <form action={volverASuscribirse} className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button className="text-sm text-neutral-700 underline underline-offset-2">{t["baja.volver_a_suscribirme"]}</button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm leading-relaxed">{t["baja.token_invalido"]}</p>
      )}

      <Link href="/" className="mt-8 inline-block text-sm text-neutral-700 underline underline-offset-2">
        {t["nav.volver_inicio"]}
      </Link>
    </main>
  );
}
