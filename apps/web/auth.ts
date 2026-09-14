import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@crop/prisma";
import authConfig from "./auth.config";

/**
 * Acceso de administrador SOLO para desarrollo local, mientras no hay
 * credenciales reales de Sign in with Apple (requieren Apple Developer
 * Program pago). Un clic, sin contraseña, crea/reutiliza un User ADMIN ya
 * consentido. Doble candado para que jamás quede vivo en producción:
 *  - `next build`/`next start` (lo que corre Vercel) siempre fija
 *    NODE_ENV=production, así que este bloque ni se registra como provider.
 *  - `authorize()` además revalida NODE_ENV por si alguna vez se reordena
 *    este archivo y el `if` de afuera desaparece por error.
 * Borrar este provider en cuanto haya AUTH_APPLE_ID/AUTH_APPLE_SECRET reales.
 */
const devProviders =
  process.env.NODE_ENV !== "production"
    ? [
        Credentials({
          id: "dev-admin",
          name: "Admin de desarrollo (solo local)",
          credentials: {},
          async authorize() {
            if (process.env.NODE_ENV === "production") return null;
            const email = process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "dev-admin@crop.local";
            try {
              const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: { email, name: "Admin (dev)", role: "ADMIN", consentedAt: new Date() },
              });
              return { id: user.id, email: user.email, name: user.name };
            } catch (err) {
              // Si la DB está caída/despertando, que falle SOLO este login
              // (NextAuth lo muestra como credenciales inválidas) en vez de
              // dejar que la excepción se propague sin controlar.
              console.error("[dev-admin] no se pudo crear/leer el usuario:", err);
              return null;
            }
          },
        }),
      ]
    : [];

/**
 * Configuración completa de Auth.js v5 para Crop (runtime Node).
 * La usan el route handler (/api/auth/[...nextauth]) y los Server Components.
 * `proxy.ts` usa solo `auth.config.ts` para no arrastrar Prisma al edge.
 *
 * Requiere en el entorno (ver .env.example):
 *   AUTH_SECRET, AUTH_APPLE_ID (Services ID), AUTH_APPLE_SECRET (client secret JWT .p8)
 */
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...devProviders],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }
      // Releer rol y consentimiento desde la DB en el sign-in y en
      // session.update() (llamado desde confirmConsent y desde la promoción a
      // ADMIN), para que esos cambios no exijan recrear la sesión.
      if (user?.id || trigger === "update") {
        try {
          const dbUser = token.id
            ? await prisma.user.findUnique({
                where: { id: token.id as string },
                select: { role: true, email: true, consentedAt: true },
              })
            : null;
          token.role = dbUser?.role ?? "USER";
          token.consented = Boolean(dbUser?.consentedAt);
          if (dbUser?.email) token.email = dbUser.email;
        } catch (err) {
          // DB caída/despertando: mantené lo que ya había en el token en vez
          // de tirar la sesión entera por un error transitorio.
          console.error("[auth] no se pudo releer el usuario desde la DB:", err);
        }
      }
      return token;
    },
  },
});
