import Link from "next/link";
import {
  addDaysManagua,
  formatTimeManagua,
  managuaDateParts,
  startOfMonthManagua,
  startOfWeekManagua,
  todayInManagua,
  type ManaguaDateParts,
} from "@/lib/datetime";
import type { WeekAppointment, WeekBlock } from "@/components/calendario/WeekGrid";

const WEEKDAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MAX_VISIBLE_PER_DAY = 3;

type MonthGridProps = {
  monthDate: ManaguaDateParts;
  appointments: WeekAppointment[];
  blocks: WeekBlock[];
};

type MonthChip =
  | { kind: "appointment"; at: Date; data: WeekAppointment }
  | { kind: "block"; at: Date; data: WeekBlock };

function sameDay(a: ManaguaDateParts, b: ManaguaDateParts) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function toComparable(parts: ManaguaDateParts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function toFecha(parts: ManaguaDateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function nextMonthStart(monthDate: ManaguaDateParts): ManaguaDateParts {
  return monthDate.month === 12
    ? { year: monthDate.year + 1, month: 1, day: 1 }
    : { year: monthDate.year, month: monthDate.month + 1, day: 1 };
}

/** Grid bounds for `monthDate`: Monday of its first visible week through the Saturday of its last (both inclusive). */
export function monthGridRange(monthDate: ManaguaDateParts): { start: ManaguaDateParts; end: ManaguaDateParts } {
  const start = startOfWeekManagua(startOfMonthManagua(monthDate));
  const limit = nextMonthStart(monthDate);
  let end = start;
  while (toComparable(addDaysManagua(end, 7)) < toComparable(limit)) {
    end = addDaysManagua(end, 7);
  }
  return { start, end: addDaysManagua(end, 5) };
}

function monthWeeks(monthDate: ManaguaDateParts): ManaguaDateParts[][] {
  const { start, end } = monthGridRange(monthDate);
  const weeks: ManaguaDateParts[][] = [];
  let cursor = start;
  while (toComparable(cursor) <= toComparable(end)) {
    weeks.push(Array.from({ length: 6 }, (_, i) => addDaysManagua(cursor, i)));
    cursor = addDaysManagua(cursor, 7);
  }
  return weeks;
}

function MonthChipLabel({ chip }: { chip: MonthChip }) {
  if (chip.kind === "appointment") {
    return (
      <p className="truncate rounded-md bg-ct-primary-soft px-1.5 py-0.5 text-[11px] text-ct-primary-deep">
        {formatTimeManagua(chip.at)} {shortName(chip.data.patient.fullName)}
      </p>
    );
  }
  return (
    <p className="truncate rounded-md border border-dashed border-ct-border px-1.5 py-0.5 text-[11px] text-ct-ink-muted">
      {formatTimeManagua(chip.at)} {chip.data.label}
    </p>
  );
}

export function MonthGrid({ monthDate, appointments, blocks }: MonthGridProps) {
  const today = todayInManagua();
  const weeks = monthWeeks(monthDate);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-6 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="font-mono text-[10px] uppercase tracking-[0.15em] text-ct-ink-muted">
            {label}
          </p>
        ))}
      </div>

      <div className="mt-1 space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-6 gap-1">
            {week.map((date) => {
              const isCurrentMonth = date.month === monthDate.month && date.year === monthDate.year;
              const isToday = sameDay(date, today);
              const fecha = toFecha(date);

              const dayChips: MonthChip[] = [
                ...appointments
                  .filter((appt) => sameDay(managuaDateParts(appt.startsAt), date))
                  .map((data): MonthChip => ({ kind: "appointment", at: data.startsAt, data })),
                ...blocks
                  .filter((block) => sameDay(managuaDateParts(block.startsAt), date))
                  .map((data): MonthChip => ({ kind: "block", at: data.startsAt, data })),
              ].sort((a, b) => a.at.getTime() - b.at.getTime());

              const visibleChips = dayChips.slice(0, MAX_VISIBLE_PER_DAY);
              const overflow = dayChips.length - visibleChips.length;

              return (
                <div
                  key={fecha}
                  className={`min-h-[92px] rounded-lg border border-ct-border p-1.5 ${
                    isCurrentMonth ? "bg-ct-surface" : "bg-ct-bg-page"
                  }`}
                >
                  <Link
                    href={`/app/calendario?vista=dia&fecha=${fecha}`}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-ct-primary-soft ${
                      isToday
                        ? "bg-ct-primary text-white hover:bg-ct-primary"
                        : isCurrentMonth
                          ? "text-ct-ink"
                          : "text-ct-ink-muted"
                    }`}
                  >
                    {date.day}
                  </Link>
                  <div className="mt-1 space-y-1">
                    {visibleChips.map((chip, index) => (
                      <MonthChipLabel key={index} chip={chip} />
                    ))}
                    {overflow > 0 && (
                      <Link
                        href={`/app/calendario?vista=dia&fecha=${fecha}`}
                        className="block truncate px-1.5 text-[11px] font-medium text-ct-ink-muted hover:text-ct-primary-deep"
                      >
                        +{overflow} más
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
