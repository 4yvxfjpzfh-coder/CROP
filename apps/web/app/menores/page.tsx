import { getSiteTexts } from "@/lib/site-text";
import { LegalBody } from "@/components/legal-body";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["legal.menores.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

// TODO(legal): revisar contra COPPA (EE.UU., menores de 13) y contra la Ley de
// Protección de la Persona frente al tratamiento de sus datos personales
// (Ley 8968, Costa Rica) antes de publicar la versión definitiva.
export default async function MenoresPage() {
  const t = await getSiteTexts();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">{t["legal.menores.heading"]}</h1>
      <p className="mt-2 text-sm text-neutral-500">{t["legal.draft_notice"]}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <LegalBody
          text={t["legal.menores.body"]}
          links={[
            { label: t["footer.privacidad"], href: "/privacy" },
            { label: t["footer.soporte"], href: "/soporte" },
          ]}
        />
      </div>
    </main>
  );
}
