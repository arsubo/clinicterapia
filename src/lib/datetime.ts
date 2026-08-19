export const MANAGUA_TZ = "America/Managua";
const MANAGUA_OFFSET_MINUTES = -360; // UTC-6, sin horario de verano

export function todayInManagua(): { year: number; month: number; day: number } {
  const managuaNow = new Date(Date.now() + MANAGUA_OFFSET_MINUTES * 60000);
  return {
    year: managuaNow.getUTCFullYear(),
    month: managuaNow.getUTCMonth() + 1,
    day: managuaNow.getUTCDate(),
  };
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

export function formatTimeManagua(date: Date): string {
  return TIME_FORMATTER.format(date);
}

export function formatWeekdayDateManagua(date: Date): string {
  const weekday = WEEKDAY_FORMATTER.format(date);
  const day = DAY_FORMATTER.format(date);
  const month = MONTH_FORMATTER.format(date);
  return `${weekday} ${day} de ${month}`.toUpperCase();
}
