"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ texts: t }: { texts: Record<string, string> }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/products", label: t["admin.nav.productos"] },
    { href: "/admin/agricultores", label: t["admin.nav.agricultores"] },
    { href: "/admin/catalogo", label: t["admin.nav.catalogo"] },
    { href: "/admin/pedidos", label: t["admin.nav.apartados"] },
    { href: "/admin/settings", label: t["admin.nav.apariencia"] },
    { href: "/admin/textos", label: t["admin.nav.textos"] },
    { href: "/admin/audit", label: t["admin.nav.registro_cambios"] },
  ];

  return (
    <nav className="mt-10 flex flex-col gap-1 text-sm">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "border-l-2 border-gold py-2 pl-3 text-cream"
                : "border-l-2 border-transparent py-2 pl-3 text-stone hover:text-cream"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
