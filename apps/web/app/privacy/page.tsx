import { getSiteTexts } from "@/lib/site-text";
import { LegalBody } from "@/components/legal-body";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["legal.privacy.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const t = await getSiteTexts();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <h1 className="text-3xl font-semibold text-neutral-900">
        {t["legal.privacy.heading"]}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">{t["legal.draft_notice"]}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <LegalBody text={t["legal.privacy.body"]} links={[]} />
      </div>
    </main>
  );
}
