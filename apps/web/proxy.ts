import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

/**
 * Primera capa de protección (convención "proxy" de Next 16), corre en edge.
 * Usa SOLO `auth.config.ts` (sin adapter de Prisma) para poder correr ahí.
 *
 * Dos cosas, sobre el JWT (barato, sin tocar la DB):
 *  1. Consentimiento obligatorio (Apple): con sesión pero sin haber aceptado
 *     Privacidad/Términos en /welcome, redirige a /welcome antes de dejar ver
 *     cualquier otra página. Sin esto, alguien podía loguearse y usar la app
 *     entera sin haber consentido nunca.
 *  2. /admin/*: exige sesión + rol ADMIN.
 *
 * La verificación autoritativa (rol/consentimiento frescos en DB + allowlist
 * ADMIN_EMAILS) vive en `requireAdmin()` y en cada página que lo necesite;
 * esto es solo la barrera rápida antes de renderizar nada.
 */
const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/signin", "/welcome", "/privacy", "/terms", "/olvide-password", "/restablecer-password"];

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  if (
    pathname.startsWith("/api") ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  const session = req.auth;

  if (session?.user && !session.user.consented) {
    return NextResponse.redirect(new URL("/welcome", nextUrl));
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const signInUrl = new URL("/signin", nextUrl);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (pathname.startsWith("/agricultor")) {
    if (!session) {
      const signInUrl = new URL("/signin", nextUrl);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (session.user?.role !== "FARMER" && session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
