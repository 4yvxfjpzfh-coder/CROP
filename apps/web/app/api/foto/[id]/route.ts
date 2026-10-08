import { prisma } from "@crop/prisma";

/**
 * Foto de un producto. Las fotos se guardan como data URI en la base; meterlas
 * enteras en el HTML del catálogo lo inflaba a varios MB y en el teléfono se
 * quedaba en "Cargando catálogo". Aquí se sirven aparte y con caché: la URL
 * lleva ?v=<updatedAt>, así que cuando cambia la foto cambia la URL.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { photoUrl: true } });
  const photo = product?.photoUrl;
  if (!photo) return new Response("No encontrada", { status: 404 });

  if (!photo.startsWith("data:")) return Response.redirect(photo, 302);

  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(photo);
  if (!match) return new Response("Formato no válido", { status: 415 });
  const [, type, isBase64, data] = match;
  const body = isBase64 ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data));

  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
