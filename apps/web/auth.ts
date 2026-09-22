import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@crop/prisma";
import { verifyPassword } from "@/lib/password";
import authConfig from "./auth.config";

// Fuerza bruta: tras este número de intentos fallidos seguidos, se bloquea
// el login de esa cuenta por un rato (independiente de quién lo intente).
const MAX_FAILED_LOGIN_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

/**
 * Correo + contraseña, para clientes que crean su propia cuenta en /registro
 * en vez de depender de Sign in with Apple (que necesita cuenta paga de
 * Apple Developer). Funciona en producción, a diferencia de "dev-admin".
 * Mensaje de error genérico a propósito: no revela si el correo existe o
 * no para evitar enumeración de cuentas.
 */
const passwordProvider = Credentials({
  id: "password",
  name: "Correo y contraseña",
  credentials: {
    email: { label: "Correo", type: "email" },
    password: { label: "Contraseña", type: "password" },
  },
  async authorize(credentials) {
    const email = String(credentials?.email ?? "").trim().toLowerCase();
    const password = String(credentials?.password ?? "");
    if (!email || !password) return null;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const isLocked = Boolean(user.lockedUntil && user.lockedUntil.getTime() > Date.now());

      // Siempre se verifica la contraseña (scrypt), incluso si ya está
      // bloqueada: si se cortara acá antes de bloquear, alguien podría medir
      // el tiempo de respuesta (rápido = bloqueada, lento = no) y saber
      // cuándo arrancó/termina el bloqueo sin necesidad del mensaje de error.
      const valid = await verifyPassword(password, user.passwordHash);

      if (isLocked || !valid) {
        if (!isLocked) {
          // Increment atómico (no un read-then-write): si no fuera atómico,
          // varios intentos en paralelo podrían leer el mismo contador
          // viejo y pisarse la escritura entre sí, dejando pasar más de
          // MAX_FAILED_LOGIN_ATTEMPTS intentos reales antes de bloquear.
          const updated = await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: { increment: 1 } },
            select: { failedLoginCount: true },
          });
          if (updated.failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000) },
            });
          }
        }
        return null;
      }

      if (user.failedLoginCount > 0 || user.lockedUntil) {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null },
        });
      }
      return { id: user.id, email: user.email, name: user.name };
    } catch (err) {
      console.error("[password-auth] no se pudo verificar el usuario:", err);
      return null;
    }
  },
});

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
  providers: [...authConfig.providers, passwordProvider, ...devProviders],
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
