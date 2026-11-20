import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { SITE_TEXT_GROUPS, SITE_TEXT_DEFAULTS } from "@/lib/site-text-defaults";
import { TextosForm } from "./textos-form";

export const dynamic = "force-dynamic";

export default async function AdminTextosPage() {
  await requireAdmin("redirect");
  // El editor muestra el texto REAL guardado (default en español + lo que el
  // admin cambió en la base), sin la reescritura de presentación de
  // getSiteTexts (que, por ejemplo, muestra "Mercado de Abastos Solidario" en
  // la web aunque en la base siga "feria del agricultor"). Así el admin edita
  // lo que de verdad está guardado, no la versión ya maquillada.
  let overrides: Record<string, string> = {};
  try {
    const rows = await prisma.siteText.findMany();
    overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    overrides = {};
  }
  const texts: Record<string, string> = { ...SITE_TEXT_DEFAULTS, ...overrides };

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        {texts["admin.nav.textos"]}
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Todo el texto que ve un cliente: menús, botones, la portada, el
        catálogo, mis apartados y las páginas legales. Dejá un campo vacío
        para volver al texto por defecto. El título y la bajada de la
        portada se editan en{" "}
        <a href="/admin/settings" className="underline underline-offset-2">
          Apariencia
        </a>
        .
      </p>
      <TextosForm groups={SITE_TEXT_GROUPS} values={texts} />
    </section>
  );
}
