/**
 * Siembra 3 productos de muestra (con fotos placeholder) y los agrega al
 * catálogo 3D, para poder ver /catalogo con contenido real sin depender del
 * panel de admin (que todavía necesita login). Es idempotente: correrlo de
 * nuevo actualiza los mismos 3 productos en vez de duplicarlos.
 *
 *   node scripts/seed-demo-products.mjs
 *
 * Borralos desde /admin/products (o con el mismo Prisma) cuando ya no los
 * necesites para las capturas/demo.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const prismaPkgDir = join(here, "../packages/prisma/");

// pnpm resuelve @prisma/client dentro del node_modules propio de
// packages/prisma, no en la raíz del monorepo. createRequire con esa base
// sigue exactamente esa resolución en vez de adivinar la ruta.
const { PrismaClient } = createRequire(join(prismaPkgDir, "package.json"))("@prisma/client");

if (!process.env.DATABASE_URL) {
  // .replace(/^﻿/, "") por si el .env quedó guardado con BOM (pasa con
  // Out-File/Set-Content de PowerShell) — si no, "DATABASE_URL=" nunca hace
  // match como primera línea y esto falla en silencio.
  const line = readFileSync(join(prismaPkgDir, ".env"), "utf8")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .find((l) => l.startsWith("DATABASE_URL="));
  if (line) {
    process.env.DATABASE_URL = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
  }
}

const prisma = new PrismaClient();

const DEMO = [
  {
    name: "Cacao en baba (excedente)",
    description: "Cacao fresco recién cosechado, excedente de la última recolección.",
    photoUrl: "https://picsum.photos/seed/crop-cacao/900/900",
    quantity: 18,
    originalPriceCents: 350000,
    discountPriceCents: 210000,
    pickupShortName: "Santa Ana",
  },
  {
    name: "Café pergamino",
    description: "Café de altura, lote pequeño que sobró del último despacho.",
    photoUrl: "https://picsum.photos/seed/crop-cafe/900/900",
    quantity: 12,
    originalPriceCents: 500000,
    discountPriceCents: 320000,
    pickupShortName: "Escazú",
  },
  {
    name: "Piñas extra maduras",
    description: "Piñas listas para consumir hoy — precio de excedente.",
    photoUrl: "https://picsum.photos/seed/crop-pina/900/900",
    quantity: 25,
    originalPriceCents: 150000,
    discountPriceCents: 80000,
    pickupShortName: "Santa Ana",
  },
];

const pickupPoints = await prisma.pickupPoint.findMany();
if (pickupPoints.length === 0) {
  console.error("No hay PickupPoint en la base. Corré primero: prisma db seed");
  process.exit(1);
}

for (const [i, item] of DEMO.entries()) {
  const pickupPoint = pickupPoints.find((p) => p.shortName === item.pickupShortName) ?? pickupPoints[0];

  const existing = await prisma.product.findFirst({ where: { name: item.name } });
  const data = {
    description: item.description,
    photoUrl: item.photoUrl,
    quantity: item.quantity,
    originalPriceCents: item.originalPriceCents,
    discountPriceCents: item.discountPriceCents,
    pickupPointId: pickupPoint.id,
    isActive: true,
    catalogPosition: i + 1,
  };

  const product = existing
    ? await prisma.product.update({ where: { id: existing.id }, data })
    : await prisma.product.create({ data: { name: item.name, ...data } });

  console.log(`✓ ${product.name} (catalogPosition ${product.catalogPosition})`);
}

await prisma.$disconnect();
