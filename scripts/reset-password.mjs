/**
 * Resetea la contraseña de una cuenta existente a un valor nuevo generado
 * al azar, y lo imprime una sola vez.
 *
 *   node scripts/reset-password.mjs <correo>
 *
 * Usa el mismo formato "salt:hash" (scrypt) que apps/web/lib/password.ts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derived.toString("hex")}`;
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(14);
  let out = "";
  for (let i = 0; i < 14; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const here = dirname(fileURLToPath(import.meta.url));
const prismaPkgDir = join(here, "../packages/prisma/");

const { PrismaClient } = createRequire(join(prismaPkgDir, "package.json"))("@prisma/client");

if (!process.env.DATABASE_URL) {
  try {
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
  console.error("Uso: node scripts/reset-password.mjs <correo>");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const newPassword = generatePassword();
  const passwordHash = await hashPassword(newPassword);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
    select: { id: true, email: true, role: true },
  });
  console.log("OK:", user);
  console.log("Nueva contraseña temporal:", newPassword);
} catch (e) {
  console.error("No se pudo. ¿Existe esa cuenta?", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
