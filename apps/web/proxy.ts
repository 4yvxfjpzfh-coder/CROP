import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

/**
 * Primera capa de protección del panel de admin (convención "proxy" de Next 16).
 *
 * Usa SOLO `auth.config.ts` (sin adapter de Prisma) para poder correr en el
 * runtime edge. Comprobación barata sobre el JWT: si no hay sesión o el rol no
 * es ADMIN, redirige antes de renderizar nada del panel.
 *
 * La verificación autoritativa (rol fresco en DB + allowlist ADMIN_EMAILS) vive
 * en `requireAdmin()` y corre en cada carga de página del panel y en cada
 * acción de escritura del servidor.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  if (!nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const signInUrl = new URL("/signin", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
