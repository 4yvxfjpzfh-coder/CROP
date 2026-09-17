import { linkifyText } from "./linkify-text";

/**
 * Renderiza un bloque de texto legal editable desde /admin/textos. Convención
 * simple: un bloque separado por línea en blanco cuya primera línea empieza
 * con "N. " se muestra como título de sección; el resto son párrafos. Así el
 * admin puede reordenar o agregar secciones sin tocar código.
 */
export function LegalBody({
  text,
  links,
}: {
  text: string;
  links: { label: string; href: string }[];
}) {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim().length > 0);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const hasHeading = lines.length > 1 && /^\d+\.\s/.test(lines[0]);
        if (hasHeading) {
          const [heading, ...rest] = lines;
          return (
            <section key={i}>
              <h2 className="text-lg font-medium text-neutral-900">{heading}</h2>
              <p>{linkifyText(rest.join(" "), links)}</p>
            </section>
          );
        }
        return <p key={i}>{linkifyText(block, links)}</p>;
      })}
    </>
  );
}
