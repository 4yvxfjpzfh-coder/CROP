import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { PickupDayForm } from "./pickup-day-form";

export const dynamic = "force-dynamic";

export default async function PuntosRecogidaPage() {
  await requireAdmin("redirect");

  const pickupPoints = await prisma.pickupPoint.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive">
        Puntos de recogida
      </h1>
      <p className="mb-8 max-w-lg font-[family-name:var(--font-form)] text-sm text-stone">
        Cada feria tiene su propio día de recogida — por ejemplo, Santa Ana
        puede ser miércoles y otra feria un día distinto. Los clientes de esa
        feria solo pueden apartar para recoger ese día, entre 7am y 4pm.
      </p>

      {pickupPoints.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          No hay puntos de recogida todavía.
        </p>
      ) : (
        <ul className="max-w-2xl divide-y divide-cream-200 border-y border-cream-200">
          {pickupPoints.map((pp) => (
            <li key={pp.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg text-olive">
                  {pp.shortName}
                </p>
                <p className="font-[family-name:var(--font-form)] text-xs text-stone">
                  {pp.address}
                </p>
              </div>
              <PickupDayForm id={pp.id} initialDay={pp.pickupDay} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
