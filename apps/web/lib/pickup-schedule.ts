// Costa Rica no usa horario de verano: el desfase con UTC es siempre -6,
// todo el año. Por eso alcanza con sumar/restar 6 horas a mano, sin
// necesitar una librería de zonas horarias (no hay ninguna en el proyecto).
const CR_UTC_OFFSET_HOURS = 6;

export const FERIA_OPEN_HOUR = 7; // 7am hora de Costa Rica
export const FERIA_CLOSE_HOUR = 16; // 4pm hora de Costa Rica
export const PICKUP_GRACE_HOURS = 2.5;

export type PickupSlot = { value: string; label: string };

/**
 * Fecha (año/mes/día en hora de Costa Rica) del próximo miércoles a partir
 * de "now". Si "now" ya es miércoles pero pasada la hora de cierre de la
 * feria, se toma el miércoles de la semana siguiente.
 */
function nextWednesdayCR(now: Date): { year: number; month: number; day: number } {
  const crShifted = new Date(now.getTime() - CR_UTC_OFFSET_HOURS * 3600 * 1000);
  const dow = crShifted.getUTCDay(); // 0=domingo ... 3=miércoles
  const crHour = crShifted.getUTCHours();

  let daysUntilWednesday = (3 - dow + 7) % 7;
  if (daysUntilWednesday === 0 && crHour >= FERIA_CLOSE_HOUR) {
    daysUntilWednesday = 7;
  }

  const target = new Date(crShifted);
  target.setUTCDate(target.getUTCDate() + daysUntilWednesday);
  return { year: target.getUTCFullYear(), month: target.getUTCMonth(), day: target.getUTCDate() };
}

/** Instante UTC real que corresponde a una hora local de Costa Rica ese día. */
function crDateTimeToUtc(year: number, month: number, day: number, crHour: number): Date {
  return new Date(Date.UTC(year, month, day, crHour + CR_UTC_OFFSET_HOURS, 0, 0));
}

/** Franjas horarias del próximo miércoles (7am a 4pm, de hora en hora). */
export function getPickupSlots(now: Date = new Date()): PickupSlot[] {
  const { year, month, day } = nextWednesdayCR(now);
  const slots: PickupSlot[] = [];
  for (let hour = FERIA_OPEN_HOUR; hour <= FERIA_CLOSE_HOUR; hour++) {
    const utc = crDateTimeToUtc(year, month, day, hour);
    const label = utc.toLocaleString("es-CR", {
      timeZone: "America/Costa_Rica",
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    slots.push({ value: utc.toISOString(), label });
  }
  return slots;
}

/**
 * Valida que el slot elegido sea de verdad uno de los del próximo miércoles
 * (nunca se confía en la fecha que manda el cliente sin recalcularla acá) y
 * devuelve la fecha límite real de recogida: la hora elegida + 2.5 horas.
 */
export function resolvePickupDeadline(selectedSlotIso: string, now: Date = new Date()): Date | null {
  const valid = getPickupSlots(now);
  const match = valid.find((s) => s.value === selectedSlotIso);
  if (!match) return null;
  return new Date(new Date(match.value).getTime() + PICKUP_GRACE_HOURS * 3600 * 1000);
}
