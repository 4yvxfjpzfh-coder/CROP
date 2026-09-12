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
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const prismaPkgDir = join(here, "../packages/prisma/");

// pnpm resuelve @prisma/client dentro del node_modules propio de
// packages/prisma, no en la raíz del monorepo.
const { PrismaClient } = createRequire(join(prismaPkgDir, "package.json"))("@prisma/client");

// Carga DATABASE_URL desde packages/prisma/.env si no está en el entorno.
if (!process.env.DATABASE_URL) {
  try {
    // .replace(/^﻿/, "") por si el .env quedó guardado con BOM (pasa con
    // Out-File/Set-Content de PowerShell).
    const line = readFileSync(join(prismaPkgDir, ".env"), "utf8")
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .find((l) => l.startsWith("DATABASE_URL="));
    if (line) {
      process.env.DATABASE_URL = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
    }
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
