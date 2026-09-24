import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { MakeFarmerForm } from "./make-farmer-form";
import { RemoveFarmerButton } from "./remove-farmer-button";

export const dynamic = "force-dynamic";

export default async function AdminFarmersPage() {
  await requireAdmin("redirect");
  const t = await getSiteTexts();

  const farmers = await prisma.user.findMany({
    where: { role: "FARMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      _count: { select: { farmerProducts: true } },
    },
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        {t["admin.agricultores.heading"]}
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        {t["admin.agricultores.subtext"]}
      </p>

      <MakeFarmerForm texts={t} />

      <h2 className="mb-3 mt-10 font-[family-name:var(--font-display)] text-xl text-olive">
        {t["admin.agricultores.activos_heading"]} ({farmers.length})
      </h2>
      {farmers.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          {t["admin.agricultores.ninguno"]}
        </p>
      ) : (
        <ul className="divide-y divide-cream-200 border-y border-cream-200">
          {farmers.map((f) => (
            <li key={f.id} className="flex items-center gap-4 py-3">
              <span className="flex-1 font-[family-name:var(--font-form)] text-sm text-olive">
                {f.name ?? f.email}
                <span className="ml-2 text-xs text-stone">
                  {f.email} · {f._count.farmerProducts} {t["admin.agricultores.productos_suffix"]}
                </span>
              </span>
              <RemoveFarmerButton userId={f.id} texts={t} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
