export const MANAGUA_TZ = "America/Managua";
const MANAGUA_OFFSET_MINUTES = -360; // UTC-6, sin horario de verano

export function managuaDateParts(date: Date): { year: number; month: number; day: number } {
  const managuaDate = new Date(date.getTime() + MANAGUA_OFFSET_MINUTES * 60000);
  return {
    year: managuaDate.getUTCFullYear(),
    month: managuaDate.getUTCMonth() + 1,
    day: managuaDate.getUTCDate(),
  };
}

export function todayInManagua(): { year: number; month: number; day: number } {
  return managuaDateParts(new Date());
}

export function formatDateInputManagua(date: Date): string {
  const { year, month, day } = managuaDateParts(date);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function managuaDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const naiveUtcMillis = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(naiveUtcMillis - MANAGUA_OFFSET_MINUTES * 60000);
}

const TIME_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  weekday: "long",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  day: "numeric",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  month: "long",
});

const SHORT_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  weekday: "short",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  timeZone: MANAGUA_TZ,
  day: "numeric",
  month: "short",
});

export function formatTimeManagua(date: Date): string {
  return TIME_FORMATTER.format(date);
}

export function formatShortWeekdayManagua(date: Date): string {
  return SHORT_WEEKDAY_FORMATTER.format(date).replace(".", "");
}

export function formatShortDateManagua(date: Date): string {
  return SHORT_DATE_FORMATTER.format(date).replace(".", "");
}

export function isSameDayManagua(date: Date, reference: { year: number; month: number; day: number }): boolean {
  const dayStart = managuaDateTimeToUtc(reference.year, reference.month, reference.day, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  return date >= dayStart && date < dayEnd;
}

export function formatWeekdayDateManagua(date: Date): string {
  const weekday = WEEKDAY_FORMATTER.format(date);
  const day = DAY_FORMATTER.format(date);
  const month = MONTH_FORMATTER.format(date);
  return `${weekday} ${day} de ${month}`.toUpperCase();
}
