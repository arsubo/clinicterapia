import Link from "next/link";
import {
  addDaysManagua,
  formatShortWeekdayManagua,
  formatTimeManagua,
  managuaDateParts,
  managuaDateTimeToUtc,
  todayInManagua,
  type ManaguaDateParts,
} from "@/lib/datetime";
import { findFreeSlots, type Interval } from "@/lib/schedule";
import { AppointmentRow } from "@/components/agenda/AppointmentRow";
import { AppointmentActionsMenu } from "@/components/calendario/AppointmentActionsMenu";
import type { WeekAppointment, WeekBlock } from "@/components/calendario/WeekGrid";

type DayViewProps = {
  weekStart: ManaguaDateParts;
  selectedDate: ManaguaDateParts;
  appointments: WeekAppointment[];
  blocks: WeekBlock[];
};

type Row =
  | { kind: "appointment"; at: Date; data: WeekAppointment }
  | { kind: "block"; at: Date; data: WeekBlock }
  | { kind: "free"; at: Date; data: Interval };

function sameDay(a: ManaguaDateParts, b: ManaguaDateParts) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function onDay<T extends { startsAt: Date }>(items: T[], date: ManaguaDateParts): T[] {
  return items.filter((item) => sameDay(managuaDateParts(item.startsAt), date));
}

function toFecha(parts: ManaguaDateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function FreeSlotRow({ interval }: { interval: Interval }) {
  const minutes = Math.round((interval.end.getTime() - interval.start.getTime()) / 60000);
  return (
    <div className="rounded-xl border border-dashed border-ct-border p-4 text-sm text-ct-ink-muted">
      <span className="font-mono text-xs">{formatTimeManagua(interval.start)}</span> · Hueco libre · {minutes} min
    </div>
  );
}

function BlockRow({ block }: { block: WeekBlock }) {
  return (
    <div className="rounded-xl border border-dashed border-ct-border bg-ct-bg-page p-4">
      <p className="font-mono text-xs text-ct-ink-muted">{formatTimeManagua(block.startsAt)}</p>
      <p className="text-sm font-medium text-ct-ink">{block.label}</p>
    </div>
  );
}

export function DayView({ weekStart, selectedDate, appointments, blocks }: DayViewProps) {
  const today = todayInManagua();

  const strip = Array.from({ length: 6 }, (_, i) => {
    const date = addDaysManagua(weekStart, i);
    return { date, count: onDay(appointments, date).length };
  });

  const dayAppointments = onDay(appointments, selectedDate).sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
  const dayBlocks = onDay(blocks, selectedDate);
  const dayStart = managuaDateTimeToUtc(selectedDate.year, selectedDate.month, selectedDate.day, 0, 0);
  const freeSlots = findFreeSlots(dayStart, dayAppointments, dayBlocks);

  const nowAppointment = sameDay(selectedDate, today)
    ? dayAppointments.find(
        (appt) => appt.status !== "DONE" && appt.status !== "CANCELLED" && appt.status !== "NO_SHOW",
      )
    : undefined;

  const rows: Row[] = [
    ...dayAppointments.map((data): Row => ({ kind: "appointment", at: data.startsAt, data })),
    ...dayBlocks.map((data): Row => ({ kind: "block", at: data.startsAt, data })),
    ...freeSlots.map((data): Row => ({ kind: "free", at: data.start, data })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return (
    <div className="mt-6">
      <div className="grid grid-cols-6 gap-1.5">
        {strip.map(({ date, count }) => {
          const isSelected = sameDay(date, selectedDate);
          const isToday = sameDay(date, today);
          return (
            <Link
              key={`${date.year}-${date.month}-${date.day}`}
              href={`/app/calendario?vista=dia&fecha=${toFecha(date)}`}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 transition-colors ${
                isSelected ? "bg-ct-primary text-white" : "hover:bg-ct-bg-page"
              }`}
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.1em] ${
                  isSelected ? "text-white/80" : "text-ct-ink-muted"
                }`}
              >
                {formatShortWeekdayManagua(managuaDateTimeToUtc(date.year, date.month, date.day, 12, 0))}
              </span>
              <span
                className={`text-base font-semibold ${
                  isSelected ? "text-white" : isToday ? "text-ct-primary-deep" : "text-ct-ink"
                }`}
              >
                {date.day}
              </span>
              <span className={`text-[10px] ${isSelected ? "text-white/70" : "text-ct-ink-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ct-ink-muted">
        {dayAppointments.length} citas · {freeSlots.length} huecos
      </p>

      <div className="mt-3 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-ct-ink-muted">Sin citas para este día.</p>
        ) : (
          rows.map((row, index) => {
            if (row.kind === "appointment") {
              return (
                <AppointmentRow
                  key={row.data.id}
                  patientId={row.data.patient.id}
                  patientName={row.data.patient.fullName}
                  reasonLabel={row.data.reasonLabel}
                  startsAt={row.data.startsAt}
                  status={row.data.status}
                  location={row.data.location}
                  isNow={nowAppointment?.id === row.data.id}
                  menu={<AppointmentActionsMenu appointmentId={row.data.id} currentStatus={row.data.status} />}
                />
              );
            }
            if (row.kind === "block") return <BlockRow key={row.data.id} block={row.data} />;
            return <FreeSlotRow key={index} interval={row.data} />;
          })
        )}
      </div>
    </div>
  );
}
