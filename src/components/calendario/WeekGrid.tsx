"use client";

import Link from "next/link";
import { useRef } from "react";
import type { AppointmentLocation, AppointmentStatus } from "@prisma/client";
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
import { DraggableChip, type DayDropTarget } from "@/components/calendario/DraggableChip";

export type WeekAppointment = {
  id: string;
  startsAt: Date;
  durationMin: number;
  status: AppointmentStatus;
  location: AppointmentLocation;
  travelMin: number | null;
  reasonLabel: string;
  patient: { id: string; fullName: string };
};

export type WeekBlock = {
  id: string;
  startsAt: Date;
  durationMin: number;
  label: string;
};

type WeekGridProps = {
  weekStart: ManaguaDateParts;
  appointments: WeekAppointment[];
  blocks: WeekBlock[];
};

type DayItem =
  | { kind: "appointment"; at: Date; data: WeekAppointment }
  | { kind: "block"; at: Date; data: WeekBlock }
  | { kind: "free"; at: Date; data: Interval };

type DayColumn = {
  date: ManaguaDateParts;
  isToday: boolean;
  items: DayItem[];
};

function buildDayColumns(
  weekStart: ManaguaDateParts,
  appointments: WeekAppointment[],
  blocks: WeekBlock[],
): DayColumn[] {
  const today = todayInManagua();

  return Array.from({ length: 6 }, (_, i) => {
    const date = addDaysManagua(weekStart, i);
    const dayStart = managuaDateTimeToUtc(date.year, date.month, date.day, 0, 0);

    const dayAppointments = appointments.filter((appt) => {
      const parts = managuaDateParts(appt.startsAt);
      return parts.year === date.year && parts.month === date.month && parts.day === date.day;
    });
    const dayBlocks = blocks.filter((block) => {
      const parts = managuaDateParts(block.startsAt);
      return parts.year === date.year && parts.month === date.month && parts.day === date.day;
    });
    const freeSlots = findFreeSlots(dayStart, dayAppointments, dayBlocks);

    const items: DayItem[] = [
      ...dayAppointments.map((data): DayItem => ({ kind: "appointment", at: data.startsAt, data })),
      ...dayBlocks.map((data): DayItem => ({ kind: "block", at: data.startsAt, data })),
      ...freeSlots.map((data): DayItem => ({ kind: "free", at: data.start, data })),
    ].sort((a, b) => a.at.getTime() - b.at.getTime());

    return {
      date,
      isToday: date.year === today.year && date.month === today.month && date.day === today.day,
      items,
    };
  });
}

function AppointmentChip({ appointment }: { appointment: WeekAppointment }) {
  const isHome = appointment.location === "HOME";
  const isUnconfirmed = appointment.status === "UNCONFIRMED";
  const isInactive = appointment.status === "CANCELLED" || appointment.status === "NO_SHOW";

  return (
    <Link
      href={`/app/calendario/${appointment.id}/editar`}
      className={`block rounded-lg border-l-4 bg-ct-surface px-2.5 py-1.5 text-xs shadow-sm transition-colors hover:bg-ct-bg-page ${
        isInactive ? "border-l-ct-border opacity-60" : isHome ? "border-l-ct-primary-deep" : "border-l-ct-primary"
      } ${isUnconfirmed ? "border border-dashed border-ct-primary/50" : "border border-transparent"}`}
    >
      <p className="font-mono text-[11px] text-ct-ink-muted">
        {formatTimeManagua(appointment.startsAt)}
        {isHome ? " · domicilio" : ""}
        {isUnconfirmed ? " · sin confirmar" : ""}
      </p>
      <p className={`truncate font-medium text-ct-ink ${isInactive ? "line-through" : ""}`}>
        {appointment.patient.fullName}
      </p>
    </Link>
  );
}

function BlockChip({ block }: { block: WeekBlock }) {
  return (
    <div className="rounded-lg border border-dashed border-ct-border bg-ct-bg-page px-2.5 py-1.5 text-xs text-ct-ink-muted">
      <p className="font-mono text-[11px]">{formatTimeManagua(block.startsAt)}</p>
      <p className="truncate font-medium">{block.label}</p>
    </div>
  );
}

function FreeSlotChip({ interval }: { interval: Interval }) {
  return (
    <div className="rounded-lg border border-dashed border-ct-border px-2.5 py-1.5 text-xs text-ct-ink-muted">
      Hueco libre · {formatTimeManagua(interval.start)}–{formatTimeManagua(interval.end)}
    </div>
  );
}

function toFecha(parts: ManaguaDateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function DayItemChip({
  item,
  fecha,
  getDayTargets,
}: {
  item: DayItem;
  fecha: string;
  getDayTargets: () => DayDropTarget[];
}) {
  if (item.kind === "appointment") {
    return (
      <DraggableChip
        appointmentId={item.data.id}
        fecha={fecha}
        hora={formatTimeManagua(item.data.startsAt)}
        getDayTargets={getDayTargets}
      >
        <AppointmentChip appointment={item.data} />
      </DraggableChip>
    );
  }
  if (item.kind === "block") return <BlockChip block={item.data} />;
  return <FreeSlotChip interval={item.data} />;
}

function LegendDot({ className }: { className: string }) {
  return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${className}`} />;
}

export function WeekGrid({ weekStart, appointments, blocks }: WeekGridProps) {
  const days = buildDayColumns(weekStart, appointments, blocks);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function getDayTargets(): DayDropTarget[] {
    return Object.entries(columnRefs.current)
      .filter((entry): entry is [string, HTMLDivElement] => entry[1] !== null)
      .map(([fecha, el]) => ({ fecha, el }));
  }

  const totalAppointments = days.reduce((sum, day) => sum + day.items.filter((i) => i.kind === "appointment").length, 0);
  const totalFreeSlots = days.reduce((sum, day) => sum + day.items.filter((i) => i.kind === "free").length, 0);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6 md:gap-3">
        {days.map((day) => {
          const fecha = toFecha(day.date);
          return (
            <div
              key={fecha}
              ref={(el) => {
                columnRefs.current[fecha] = el;
              }}
              className={day.isToday ? "rounded-xl bg-ct-primary-soft/30 p-2 -m-2" : ""}
            >
              <p
                className={`font-mono text-xs uppercase tracking-[0.15em] md:text-center ${
                  day.isToday ? "text-ct-primary-deep" : "text-ct-ink-muted"
                }`}
              >
                {formatShortWeekdayManagua(
                  managuaDateTimeToUtc(day.date.year, day.date.month, day.date.day, 12, 0),
                )}{" "}
                <span className="font-semibold text-sm md:block md:text-lg">{day.date.day}</span>
              </p>
              <div className="mt-2 space-y-1.5">
                {day.items.length === 0 ? (
                  <p className="text-sm text-ct-ink-muted">Sin citas</p>
                ) : (
                  day.items.map((item, index) => (
                    <DayItemChip key={index} item={item} fecha={fecha} getDayTargets={getDayTargets} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ct-border pt-3 text-xs text-ct-ink-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <LegendDot className="bg-ct-primary" />
            En consulta
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot className="bg-ct-primary-deep" />
            A domicilio
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-ct-primary" />
            Sin confirmar
          </span>
        </div>
        <p>
          {totalAppointments} sesiones esta semana · {totalFreeSlots} huecos libres
        </p>
      </div>
    </div>
  );
}
