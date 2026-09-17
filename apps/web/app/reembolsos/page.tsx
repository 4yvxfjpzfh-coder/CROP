import { getSiteTexts } from "@/lib/site-text";
import { LegalBody } from "@/components/legal-body";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["legal.reembolsos.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

// TODO(legal): reemplazar este placeholder con el texto legal final, revisado
// contra la Ley de Promoción de la Competencia y Defensa Efectiva del
// Consumidor (Costa Rica) y demás normativa local aplicable.
export default async function ReembolsosPage() {
  const t = await getSiteTexts();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">
        {t["legal.reembolsos.heading"]}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">{t["legal.draft_notice"]}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <LegalBody
          text={t["legal.reembolsos.body"]}
          links={[{ label: t["nav.mis_apartados"], href: "/mis-apartados" }]}
        />
      </div>
    </main>
  );
}
