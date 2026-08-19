export const EXPECTED_LOGS_PER_ITEM_PER_WEEK = 3;

export function calculateRoutineAdherence(routine: {
  items: unknown[];
  logs: unknown[];
}): number | null {
  if (routine.items.length === 0) return null;

  const expected = routine.items.length * EXPECTED_LOGS_PER_ITEM_PER_WEEK;
  return Math.min(100, Math.round((routine.logs.length / expected) * 100));
}

export function averageAdherence(rates: number[]): number | null {
  if (rates.length === 0) return null;
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
}
