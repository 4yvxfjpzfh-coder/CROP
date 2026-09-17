import Link from "next/link";
import { Fragment } from "react";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convierte apariciones exactas de `label` dentro de `text` en enlaces.
 * Se usa para textos legales/de bienvenida editables desde admin que
 * mencionan otra página ("Mis apartados", "Política de Privacidad"...): si
 * el admin renombra la etiqueta, esa mención deja de convertirse en enlace
 * en vez de romper la página.
 */
export function linkifyText(
  text: string,
  links: { label: string; href: string }[],
) {
  const usable = links.filter((l) => l.label.trim().length > 0);
  if (usable.length === 0) return text;
  const pattern = new RegExp(`(${usable.map((l) => escapeRegExp(l.label)).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const link = usable.find((l) => l.label === part);
    if (link) {
      return (
        <Link key={i} href={link.href} className="underline underline-offset-2">
          {part}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
