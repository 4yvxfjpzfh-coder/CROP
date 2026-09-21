export function formatPickupDeadline(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" });
}
