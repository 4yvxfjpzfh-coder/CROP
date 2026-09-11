/**
 * Promueve una cuenta a rol ADMIN. Corré esto UNA vez, después de tu primer
 * login con Apple (para que la fila User ya exista).
 *
 *   node scripts/make-admin.mjs tu-correo@ejemplo.com
 *
 * Luego cerrá sesión y volvé a entrar (el rol entra al JWT al autenticar).
 * Recordá que el correo también debe estar en ADMIN_EMAILS (apps/web/.env.local).
 *
 * Usa DATABASE_URL de packages/prisma/.env.
 */
import { PrismaClient } from "../node_modules/@prisma/client/index.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Carga DATABASE_URL desde packages/prisma/.env si no está en el entorno.
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(join(here, "../packages/prisma/.env"), "utf8");
    const m = env.match(/^DATABASE_URL="?(.+?)"?\s*$/m);
    if (m) process.env.DATABASE_URL = m[1];
  } catch {}
}

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/make-admin.mjs <correo>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });
  console.log("OK:", user);
  console.log("Ahora agregá ese correo a ADMIN_EMAILS y volvé a iniciar sesión.");
} catch (e) {
  console.error(
    "No se pudo. ¿Ya iniciaste sesión al menos una vez con ese correo?",
    e.message,
  );
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
