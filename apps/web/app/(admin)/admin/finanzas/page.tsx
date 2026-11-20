import { requireAdmin } from "@/lib/admin-guard";
import { colones } from "../products/types";
import { crDayRangeUtc } from "@/lib/pickup-schedule";
import { crTodayIso, crWeekRange, crMonthRange, financeReport, type FinanceReport } from "@/lib/finance";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

function SummaryCard({ title, report }: { title: string; report: FinanceReport }) {
  return (
    <div className="border border-cream-200 bg-white p-4">
      <h3 className="font-[family-name:var(--font-display)] text-lg text-olive">{title}</h3>
      <dl className="mt-3 flex flex-col gap-1.5 font-[family-name:var(--font-form)] text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-stone">Venta de productos (a pagar)</dt>
          <dd className="font-medium text-olive tabular-nums">{colones(report.productCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-stone">Tu comisión (11%)</dt>
          <dd className="font-semibold text-gold-text tabular-nums">{colones(report.commissionCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-cream-200 pt-1.5">
          <dt className="text-stone">Total cobrado al cliente</dt>
          <dd className="font-medium text-olive tabular-nums">{colones(report.totalChargedCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-stone">Pedidos</dt>
          <dd className="text-olive tabular-nums">
            {report.orderCount}
            {report.cancelledCount > 0 ? ` · ${report.cancelledCount} cancelado/vencido` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default async function AdminFinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  await requireAdmin("redirect");
  const { fecha } = await searchParams;
  const today = crTodayIso();
  const reportDate = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : today;

  const todayR = crDayRangeUtc(today);
  const weekR = crWeekRange(today);
  const monthR = crMonthRange(today);
  const dayR = crDayRangeUtc(reportDate);

  const [hoy, semana, mes, dia] = await Promise.all([
    financeReport(todayR.start, todayR.end),
    financeReport(weekR.start, weekR.end),
    financeReport(monthR.start, monthR.end),
    financeReport(dayR.start, dayR.end),
  ]);

  const dateLabel = new Date(dayR.start).toLocaleDateString("es-CR", {
    timeZone: "America/Costa_Rica",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-olive print:hidden">
        Finanzas
      </h1>
      <p className="mb-8 max-w-xl font-[family-name:var(--font-form)] text-sm text-stone print:hidden">
        Ventas, tu comisión del 11% y cuánto le toca a cada agricultor. El 11% se
        le cobra al cliente aparte: el agricultor recibe el 100% de su precio, y
        el &quot;pago al agricultor&quot; es justo eso. Se cuentan los pedidos
        apartados y recogidos según su fecha de recogida.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3 print:hidden">
        <SummaryCard title="Hoy" report={hoy} />
        <SummaryCard title="Esta semana" report={semana} />
        <SummaryCard title="Este mes" report={mes} />
      </div>

      {/* Reporte de fin de día */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-olive">
          Reporte por agricultor
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <form method="get" className="flex items-end gap-2">
            <div>
              <label
                htmlFor="fecha"
                className="mb-1 block font-[family-name:var(--font-form)] text-xs text-stone"
              >
                Día
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={reportDate}
                className="border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive"
              />
            </div>
            <button
              type="submit"
              className="border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200"
            >
              Ver
            </button>
          </form>
          <a
            href={`/admin/finanzas/export?fecha=${reportDate}`}
            className="border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200"
          >
            Descargar Excel (CSV)
          </a>
          <PrintButton label="Imprimir / PDF" />
        </div>
      </div>

      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-olive">
        Reporte del {dateLabel}
      </h2>

      {dia.byFarmer.length === 0 ? (
        <p className="font-[family-name:var(--font-form)] text-sm text-stone">
          No hay ventas para ese día.
        </p>
      ) : (
        <table className="w-full border-collapse font-[family-name:var(--font-form)] text-sm">
          <thead>
            <tr className="border-b-2 border-olive text-left">
              <th className="py-2 pr-3">Agricultor</th>
              <th className="py-2 pr-3 text-right">Productos</th>
              <th className="py-2 pr-3 text-right">Venta bruta</th>
              <th className="py-2 pr-3 text-right">Comisión 11%</th>
              <th className="py-2 pr-3 text-right">Pago al agricultor</th>
            </tr>
          </thead>
          <tbody>
            {dia.byFarmer.map((row) => (
              <tr key={row.farmer} className="border-b border-cream-200">
                <td className="py-2 pr-3">{row.farmer}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{row.lines}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{colones(row.grossCents)}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-stone">
                  {colones(row.commissionCents)}
                </td>
                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-olive">
                  {colones(row.grossCents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-olive font-medium">
              <td className="py-2 pr-3">TOTAL</td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {dia.byFarmer.reduce((s, r) => s + r.lines, 0)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{colones(dia.productCents)}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-gold-text">
                {colones(dia.commissionCents)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{colones(dia.productCents)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      <p className="mt-4 font-[family-name:var(--font-form)] text-xs text-stone">
        Total cobrado al cliente ese día: {colones(dia.totalChargedCents)} (productos{" "}
        {colones(dia.productCents)} + comisión {colones(dia.commissionCents)}).
      </p>
    </section>
  );
}
