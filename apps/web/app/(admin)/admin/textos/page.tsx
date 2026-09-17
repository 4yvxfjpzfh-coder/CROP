import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { SITE_TEXT_GROUPS } from "@/lib/site-text-defaults";
import { TextosForm } from "./textos-form";

export const dynamic = "force-dynamic";

export default async function AdminTextosPage() {
  await requireAdmin("redirect");
  const texts = await getSiteTexts();

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Textos
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
