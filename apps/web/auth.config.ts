import type { NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";

/**
 * Configuración de Auth.js SIN el adapter de Prisma ni imports de Node.
 * La consume `proxy.ts` (runtime edge), donde Prisma no puede ejecutarse.
 * `auth.ts` la extiende con el adapter y el callback `jwt` que sí toca la DB.
 */
export default {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
      // Apple solo entrega name/email en la PRIMERA autorización.
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? null,
          email: profile.email ?? null,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
