import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireAdmin("redirect");
  const t = await getSiteTexts();

  const actionLabel: Record<string, string> = {
    PRODUCT_CREATE: t["admin.audit.action_create"],
    PRODUCT_UPDATE: t["admin.audit.action_update"],
    PRODUCT_DELETE: t["admin.audit.action_delete"],
  };

  const entries = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-3xl text-olive">
        {t["admin.audit.heading"]}
      </h1>

      {entries.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          {t["admin.audit.empty"]}
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
