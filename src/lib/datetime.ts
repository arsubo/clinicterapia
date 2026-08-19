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
