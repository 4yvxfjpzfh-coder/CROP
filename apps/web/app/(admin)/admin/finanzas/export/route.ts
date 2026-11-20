import { requireAdmin } from "@/lib/admin-guard";
import { crDayRangeUtc } from "@/lib/pickup-schedule";
import { crTodayIso, financeReport } from "@/lib/finance";

export const dynamic = "force-dynamic";

// Una celda CSV: se encierra en comillas si trae coma, comillas o salto de línea.
function csvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
const money = (cents: number) => (Math.round(cents) / 100).toFixed(2);

export async function GET(req: Request) {
  try {
    await requireAdmin("throw");
  } catch {
    return new Response("No autorizado", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("fecha");
  const fecha = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : crTodayIso();
  const { start, end } = crDayRangeUtc(fecha);
  const rep = await financeReport(start, end);

  const rows: string[][] = [
    ["Agricultor", "Productos (lineas)", "Venta bruta (CRC)", "Comision 11% (CRC)", "Pago al agricultor (CRC)"],
  ];
  for (const r of rep.byFarmer) {
    rows.push([r.farmer, String(r.lines), money(r.grossCents), money(r.commissionCents), money(r.grossCents)]);
  }
  rows.push([
    "TOTAL",
    String(rep.byFarmer.reduce((s, r) => s + r.lines, 0)),
    money(rep.productCents),
    money(rep.commissionCents),
    money(rep.productCents),
  ]);
  rows.push([]);
  rows.push(["Total cobrado al cliente (CRC)", money(rep.totalChargedCents)]);

  // BOM (﻿) para que Excel abra bien los acentos en UTF-8.
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="reporte-finanzas-${fecha}.csv"`,
      "cache-control": "no-store",
    },
  });
}
