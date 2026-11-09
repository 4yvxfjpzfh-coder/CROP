import { NextResponse } from "next/server";
import { prisma } from "@crop/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

/**
 * Ruta temporal de un solo click: apunta la foto del hero y la de Fresas
 * (rotas por un link de resultados de búsqueda de Bing pegado por error) a
 * las fotos ya incluidas en /public/demo. Usa la sesión real de admin
 * (requireAdmin) en vez de un secreto nuevo. Solo toca algo si todavía está
 * roto, así no hay drama en volver a visitarla sin querer. Se borra este
 * archivo apenas se confirma que corrió bien (ver commit siguiente).
 */
export async function GET() {
  await requireAdmin("redirect");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  let heroFixed = false;
  if (!settings?.heroImageUrl || settings.heroImageUrl.includes("bing.com")) {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: { heroImageUrl: "/demo/hero-canasta.jpg" },
      create: { id: "default", heroImageUrl: "/demo/hero-canasta.jpg" },
    });
    heroFixed = true;
  }

  const brokenFruit = await prisma.homeFruit.findFirst({
    where: { imageUrl: { contains: "bing.com" } },
  });
  let fruitFixed = false;
  if (brokenFruit) {
    await prisma.homeFruit.update({
      where: { id: brokenFruit.id },
      data: { imageUrl: "/demo/fresas.jpg" },
    });
    fruitFixed = true;
  }

  return NextResponse.json({ ok: true, heroFixed, fruitFixed });
}
