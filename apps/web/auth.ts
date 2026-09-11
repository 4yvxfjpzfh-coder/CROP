import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@crop/prisma";
import authConfig from "./auth.config";

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
        const dbUser = token.id
          ? await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, email: true, consentedAt: true },
            })
          : null;
        token.role = dbUser?.role ?? "USER";
        token.consented = Boolean(dbUser?.consentedAt);
        if (dbUser?.email) token.email = dbUser.email;
      }
      return token;
    },
  },
});
