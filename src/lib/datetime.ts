export const MANAGUA_TZ = "America/Managua";
const MANAGUA_OFFSET_MINUTES = -360; // UTC-6, sin horario de verano

export type ManaguaDateParts = { year: number; month: number; day: number };

export function managuaDateParts(date: Date): ManaguaDateParts {
  const managuaDate = new Date(date.getTime() + MANAGUA_OFFSET_MINUTES * 60000);
  return {
    year: managuaDate.getUTCFullYear(),
    month: managuaDate.getUTCMonth() + 1,
    day: managuaDate.getUTCDate(),
  };
}

export function todayInManagua(): ManaguaDateParts {
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

export function isSameDayManagua(date: Date, reference: ManaguaDateParts): boolean {
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

// El día de la semana y el número de semana de una fecha calendario son
// propiedades del calendario gregoriano, no de una zona horaria: Date.UTC
// aquí nunca consulta el reloj ni el TZ del proceso, así que esta aritmética
// queda inmune a un TZ de servidor distinto de America/Managua.
function calendarDateUtc(parts: ManaguaDateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function calendarDateParts(date: Date): ManaguaDateParts {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function addDaysManagua(parts: ManaguaDateParts, days: number): ManaguaDateParts {
  return calendarDateParts(new Date(calendarDateUtc(parts).getTime() + days * 24 * 60 * 60 * 1000));
}

export function startOfWeekManagua(parts: ManaguaDateParts): ManaguaDateParts {
  const weekday = calendarDateUtc(parts).getUTCDay(); // 0 = domingo
  const offsetFromMonday = weekday === 0 ? 6 : weekday - 1;
  return addDaysManagua(parts, -offsetFromMonday);
}

export function startOfMonthManagua(parts: ManaguaDateParts): ManaguaDateParts {
  return { year: parts.year, month: parts.month, day: 1 };
}

export function weekNumberManagua(parts: ManaguaDateParts): number {
  const date = calendarDateUtc(parts);
  const isoWeekday = date.getUTCDay() || 7; // domingo = 7
  date.setUTCDate(date.getUTCDate() + 4 - isoWeekday);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatMonthYearManagua(parts: ManaguaDateParts): string {
  const reference = managuaDateTimeToUtc(parts.year, parts.month, 1, 12, 0);
  return `${MONTH_FORMATTER.format(reference)} ${parts.year}`.toUpperCase();
}
