import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

const actionLabel: Record<string, string> = {
  PRODUCT_CREATE: "Creó",
  PRODUCT_UPDATE: "Editó",
  PRODUCT_DELETE: "Eliminó",
};

export default async function AuditPage() {
  await requireAdmin("redirect");

  const entries = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-3xl text-olive">
        Registro de cambios
      </h1>

      {entries.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          Sin actividad registrada.
        </p>
      ) : (
        <ul className="divide-y divide-cream-200 border-y border-cream-200">
          {entries.map((e) => (
            <li key={e.id} className="flex items-baseline gap-4 py-3">
              <time className="w-40 shrink-0 font-[family-name:var(--font-form)] text-xs text-stone">
                {e.createdAt.toLocaleString("es-CR")}
              </time>
              <span className="font-[family-name:var(--font-form)] text-sm text-olive">
                <span className="text-stone">{e.actorEmail}</span>{" "}
                {actionLabel[e.action] ?? e.action}{" "}
                {e.summary ?? `${e.entityType} ${e.entityId ?? ""}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
