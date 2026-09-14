/**
 * Fondo de página configurable desde /admin/settings. Con foto: se fija al
 * hacer scroll (background-attachment: fixed = efecto de profundidad/parallax
 * sin JS) y lleva un degradé oscuro encima para que el texto blanco siga
 * siendo legible sin importar la foto. Sin foto: patrón de hojas por defecto.
 */
export function SiteBackground({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-ink bg-[length:700px_700px]"
        style={{ backgroundImage: "url(/demo/pattern-hojas.svg)" }}
      />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="size-full bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,15,13,0.4) 0%, rgba(13,15,13,0.6) 100%)",
        }}
      />
    </div>
  );
}
