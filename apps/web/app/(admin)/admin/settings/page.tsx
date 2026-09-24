import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { SettingsForm } from "./settings-form";
import { FruitsManager } from "./fruits-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin("redirect");

  const [settings, fruits] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.homeFruit.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Apariencia
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Todo lo de acá se aplica en la página de inicio (y la foto de fondo,
        también en el catálogo).
      </p>
      <SettingsForm
        initialUrl={settings?.homeBackgroundUrl ?? ""}
        initialHeadline={settings?.homeHeadline ?? ""}
        initialSubtext={settings?.homeSubtext ?? ""}
      />

      <h2 className="mb-3 mt-12 font-[family-name:var(--font-display)] text-xl text-olive">
        Frutas del carrusel del home
      </h2>
      <p className="mb-4 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Si no agregás ninguna, el home usa el set por defecto (cacao, café,
        banano, piña).
      </p>
      <FruitsManager
        fruits={fruits.map((f) => ({ id: f.id, name: f.name, imageUrl: f.imageUrl, blurb: f.blurb }))}
      />
    </section>
  );
}
