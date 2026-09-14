"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/agricultores", label: "Agricultores" },
  { href: "/admin/catalogo", label: "Catálogo 3D" },
  { href: "/admin/pedidos", label: "Apartados" },
  { href: "/admin/settings", label: "Apariencia" },
  { href: "/admin/audit", label: "Registro de cambios" },
];

export function AdminNav() {
  const pathname = usePathname();

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
