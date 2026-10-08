import { prisma } from "@crop/prisma";

/**
 * Imágenes de la configuración del sitio guardadas como data URI (fondo,
 * imagen principal, frutas del inicio). Servirlas aparte y con caché evita
 * meter cientos de KB en cada página. La URL lleva ?v=<hash>, así que si la
 * imagen cambia, cambia la URL.
 *   /api/imagen/ajuste/fondo   /api/imagen/ajuste/hero   /api/imagen/fruta/<id>
 */
export async function GET(_req: Request, { params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params;
  let value: string | null | undefined;
  if (tipo === "ajuste" && (id === "fondo" || id === "hero")) {
    const s = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { homeBackgroundUrl: true, heroImageUrl: true },
    });
    value = id === "fondo" ? s?.homeBackgroundUrl : s?.heroImageUrl;
  } else if (tipo === "fruta") {
    value = (await prisma.homeFruit.findUnique({ where: { id }, select: { imageUrl: true } }))?.imageUrl;
  }
  if (!value) return new Response("No encontrada", { status: 404 });
  if (!value.startsWith("data:")) return Response.redirect(value, 302);

  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(value);
  if (!match) return new Response("Formato no válido", { status: 415 });
  const [, type, isBase64, data] = match;
  const body = isBase64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data));
  return new Response(body, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
