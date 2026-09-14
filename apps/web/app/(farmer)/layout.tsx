import type { ReactNode } from "react";
import Link from "next/link";
import { requireFarmer } from "@/lib/farmer-guard";

export default async function FarmerLayout({ children }: { children: ReactNode }) {
  const actor = await requireFarmer("redirect");

  return (
    <div className="flex min-h-dvh bg-cream font-[family-name:var(--font-form)] text-olive">
      <aside className="flex w-64 shrink-0 flex-col justify-between bg-olive px-6 py-8 text-cream">
        <div>
          <Link href="/agricultor" className="block">
            <span className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight">
              Crop
            </span>
            <span className="mt-1 block text-xs text-stone">Panel del agricultor</span>
          </Link>
          <nav className="mt-10 flex flex-col gap-1 text-sm">
            <Link href="/agricultor/productos" className="border-l-2 border-transparent py-2 pl-3 text-stone hover:text-cream">
              Mis productos
            </Link>
            <Link href="/agricultor/pedidos" className="border-l-2 border-transparent py-2 pl-3 text-stone hover:text-cream">
              Pedidos
            </Link>
          </nav>
        </div>

        <div className="border-t border-olive-700 pt-4 text-xs leading-relaxed text-stone">
          <p className="text-cream">{actor.name ?? "Agricultor"}</p>
          <p>{actor.email}</p>
          <Link href="/" className="mt-2 block text-cream underline underline-offset-4">
            Salir del panel
          </Link>
          <Link href="/api/auth/signout" className="mt-1 block text-cream underline underline-offset-4">
            Cerrar sesión
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden px-10 py-8">{children}</main>
    </div>
  );
}
