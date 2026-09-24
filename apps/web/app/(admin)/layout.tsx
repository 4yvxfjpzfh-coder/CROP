import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { AdminNav } from "./admin/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Verificación autoritativa del lado del servidor (rol en DB + allowlist).
  // El middleware ya filtró antes, esto es la segunda barrera.
  const [actor, t] = await Promise.all([requireAdmin("redirect"), getSiteTexts()]);

  return (
    <div className="flex min-h-dvh bg-cream font-[family-name:var(--font-form)] text-olive">
      <aside className="flex w-64 shrink-0 flex-col justify-between bg-olive px-6 py-8 text-cream">
        <div>
          <Link href="/admin" className="block">
            <span className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight">
              Crop
            </span>
            <span className="mt-1 block text-xs text-stone">
              {t["admin.nav.subtitulo"]}
            </span>
          </Link>
          <AdminNav texts={t} />
        </div>

        <div className="border-t border-olive-700 pt-4 text-xs leading-relaxed text-stone">
          <p className="text-cream">{actor.name ?? t["admin.nav.administracion"]}</p>
          <p>{actor.email}</p>
          <Link href="/" className="mt-2 block text-cream underline underline-offset-4">
            {t["admin.nav.salir_panel"]}
          </Link>
          <Link href="/api/auth/signout" className="mt-1 block text-cream underline underline-offset-4">
            {t["admin.nav.cerrar_sesion"]}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden px-10 py-8">{children}</main>
    </div>
  );
}
