import { prisma } from "@crop/prisma";
import { crDayRangeUtc } from "./pickup-schedule";

// Costa Rica no usa horario de verano: desfase fijo con UTC de -6 todo el año.
const CR_UTC_OFFSET_HOURS = 6;

// Comisión de la plataforma: 11% del precio de los productos. En el modelo que
// se usa hoy el 11% se COBRA ENCIMA al cliente (el agricultor recibe el 100%
// de su precio), así que acá "comisión" es lo que gana la plataforma y "pago
// al agricultor" = la venta bruta, no un descuento sobre ella.
export const FINANCE_FEE_RATE = 0.11;

/** Fecha de hoy (YYYY-MM-DD) en hora de Costa Rica. */
export function crTodayIso(now: Date = new Date()): string {
  return new Date(now.getTime() - CR_UTC_OFFSET_HOURS * 3600 * 1000).toISOString().slice(0, 10);
}

const isoOf = (d: Date) => d.toISOString().slice(0, 10);

/** Rango UTC [inicio, fin) de la semana (lunes a domingo, hora CR) que contiene `iso`. */
export function crWeekRange(iso: string): { start: Date; end: Date } {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  const monday = new Date(Date.UTC(y, m - 1, d - ((dow + 6) % 7)));
  const sunday = new Date(monday.getTime() + 6 * 24 * 3600 * 1000);
  return { start: crDayRangeUtc(isoOf(monday)).start, end: crDayRangeUtc(isoOf(sunday)).end };
}

/** Rango UTC [inicio, fin) del mes (hora CR) que contiene `iso`. */
export function crMonthRange(iso: string): { start: Date; end: Date } {
  const [y, m] = iso.split("-").map(Number);
  const firstIso = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // día 0 del mes siguiente = último día de este
  const lastIso = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start: crDayRangeUtc(firstIso).start, end: crDayRangeUtc(lastIso).end };
}

export type FarmerRow = {
  farmer: string;
  lines: number; // cantidad de líneas de producto vendidas
  grossCents: number; // venta bruta = lo que se le paga al agricultor (100%)
  commissionCents: number; // 11% que ganó la plataforma sobre esa venta (cobrado aparte al cliente)
};

export type FinanceReport = {
  orderCount: number; // pedidos (apartados + recogidos) en el rango
  cancelledCount: number; // cancelados + vencidos en el rango
  productCents: number; // suma de ventas de producto = total a pagar a agricultores
  commissionCents: number; // 11% total = ganancia de la plataforma
  totalChargedCents: number; // producto + comisión = lo que paga el cliente
  byFarmer: FarmerRow[];
};

/**
 * Arma el reporte financiero de los pedidos cuya fecha de recogida (`pickupBy`)
 * cae dentro del rango [start, end). Se cuentan los pedidos vivos (apartados y
 * recogidos), igual que la hoja de feria; los cancelados/vencidos se cuentan
 * aparte solo para referencia. El desglose se agrupa por agricultor (cuenta
 * vinculada o, si no, el nombre escrito a mano).
 */
export async function financeReport(
  start: Date,
  end: Date,
  sinAgricultor = "Sin agricultor",
): Promise<FinanceReport> {
  const [orders, cancelledCount] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["RESERVED", "PICKED_UP"] }, pickupBy: { gte: start, lt: end } },
      select: {
        items: {
          select: {
            quantity: true,
            unitPriceCents: true,
            product: { select: { providerName: true, farmer: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.order.count({
      where: { status: { in: ["CANCELLED", "EXPIRED"] }, pickupBy: { gte: start, lt: end } },
    }),
  ]);

  const map = new Map<string, FarmerRow>();
  let productCents = 0;
  for (const o of orders) {
    for (const i of o.items) {
      const farmer = i.product.farmer?.name ?? i.product.providerName ?? sinAgricultor;
      const cents = Math.round(i.quantity * i.unitPriceCents);
      productCents += cents;
      const row = map.get(farmer) ?? { farmer, lines: 0, grossCents: 0, commissionCents: 0 };
      row.lines += 1;
      row.grossCents += cents;
      map.set(farmer, row);
    }
  }

  // La comisión total se suma de las comisiones por agricultor para que la
  // tabla cuadre exacto con el total (y no quede una diferencia de redondeo).
  let commissionCents = 0;
  for (const row of map.values()) {
    row.commissionCents = Math.round(row.grossCents * FINANCE_FEE_RATE);
    commissionCents += row.commissionCents;
  }

  const byFarmer = [...map.values()].sort((a, b) => b.grossCents - a.grossCents);
  return {
    orderCount: orders.length,
    cancelledCount,
    productCents,
    commissionCents,
    totalChargedCents: productCents + commissionCents,
    byFarmer,
  };
}
