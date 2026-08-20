import type { Appointment, CalendarBlock } from "@prisma/client";
import { managuaDateParts, managuaDateTimeToUtc } from "@/lib/datetime";

export const WORKING_HOURS = { startHour: 8, endHour: 19 };
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // lunes a sábado
export const SLOT_MIN = 30; // granularidad de la rejilla y del arrastre
export const MIN_FREE_SLOT_MIN = 45; // un hueco menor que esto no se anuncia

export type Interval = { start: Date; end: Date };

type OccupyingAppointment = Pick<
  Appointment,
  "startsAt" | "durationMin" | "location" | "travelMin" | "status"
>;

type OccupyingBlock = Pick<CalendarBlock, "startsAt" | "durationMin">;

// HOME reserva el tiempo de viaje antes y después; CANCELLED/NO_SHOW no ocupan nada.
export function occupiedInterval(appointment: OccupyingAppointment): Interval | null {
  if (appointment.status === "CANCELLED" || appointment.status === "NO_SHOW") {
    return null;
  }

  const start = appointment.startsAt;
  const end = new Date(start.getTime() + appointment.durationMin * 60000);

  if (appointment.location === "HOME" && appointment.travelMin) {
    const travelMs = appointment.travelMin * 60000;
    return { start: new Date(start.getTime() - travelMs), end: new Date(end.getTime() + travelMs) };
  }

  return { start, end };
}

export function blockInterval(block: OccupyingBlock): Interval {
  return { start: block.startsAt, end: new Date(block.startsAt.getTime() + block.durationMin * 60000) };
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

// `dayStart` solo ubica el día en Managua; su hora se ignora.
export function findFreeSlots(
  dayStart: Date,
  appointments: OccupyingAppointment[],
  blocks: OccupyingBlock[],
): Interval[] {
  const { year, month, day } = managuaDateParts(dayStart);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = domingo
  if (!WORKING_DAYS.includes(weekday)) {
    return [];
  }

  const workStart = managuaDateTimeToUtc(year, month, day, WORKING_HOURS.startHour, 0);
  const workEnd = managuaDateTimeToUtc(year, month, day, WORKING_HOURS.endHour, 0);

  const occupied = [
    ...appointments.map(occupiedInterval).filter((interval): interval is Interval => interval !== null),
    ...blocks.map(blockInterval),
  ]
    .map((interval) => ({
      start: interval.start < workStart ? workStart : interval.start,
      end: interval.end > workEnd ? workEnd : interval.end,
    }))
    .filter((interval) => interval.start < interval.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const freeSlots: Interval[] = [];
  let cursor = workStart;
  for (const interval of occupied) {
    if (interval.start > cursor) {
      freeSlots.push({ start: cursor, end: interval.start });
    }
    if (interval.end > cursor) {
      cursor = interval.end;
    }
  }
  if (workEnd > cursor) {
    freeSlots.push({ start: cursor, end: workEnd });
  }

  return freeSlots.filter((slot) => (slot.end.getTime() - slot.start.getTime()) / 60000 >= MIN_FREE_SLOT_MIN);
}
