import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Puntos de recogida iniciales: las dos ferias del agricultor.
 * Idempotente (upsert por `name`), se puede correr varias veces.
 *
 *   pnpm --filter @crop/prisma exec prisma db seed
 */
const pickupPoints = [
  {
    name: "Feria del Agricultor de Santa Ana",
    shortName: "Santa Ana",
    address: "Antiguo plantel municipal, Santa Ana, San José",
    latitude: 9.9326,
    longitude: -84.1836,
  },
  {
    name: "Feria del Agricultor de Escazú",
    shortName: "Escazú",
    address: "Bulevar de Escazú, San Rafael de Escazú, San José",
    latitude: 9.9187,
    longitude: -84.1332,
  },
];

async function main() {
  for (const pp of pickupPoints) {
    const existing = await prisma.pickupPoint.findFirst({ where: { name: pp.name } });
    if (existing) {
      await prisma.pickupPoint.update({ where: { id: existing.id }, data: pp });
    } else {
      await prisma.pickupPoint.create({ data: pp });
    }
    console.log(`✓ ${pp.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
