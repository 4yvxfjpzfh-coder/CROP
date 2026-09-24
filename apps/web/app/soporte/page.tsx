import Link from "next/link";
import { getSiteTexts } from "@/lib/site-text";
import { LegalBody } from "@/components/legal-body";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["soporte.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

export default async function SoportePage() {
  const t = await getSiteTexts();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-neutral-800">
      <Link href="/" className="text-sm text-neutral-500 underline underline-offset-2">
        {t["nav.volver_inicio"]}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
        {t["soporte.heading"]}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">{t["soporte.subtext"]}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <LegalBody text={t["soporte.body"]} links={[{ label: t["nav.mis_apartados"], href: "/mis-apartados" }]} />
      </div>
    </main>
  );
}
