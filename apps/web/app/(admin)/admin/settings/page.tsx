import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin("redirect");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Apariencia
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        La foto que elijas acá se usa de fondo en la página de inicio y en el
        catálogo 3D.
      </p>
      <SettingsForm initialUrl={settings?.homeBackgroundUrl ?? ""} />
    </section>
  );
}
