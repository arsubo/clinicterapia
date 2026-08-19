import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addDaysManagua,
  formatMonthYearManagua,
  formatShortDateManagua,
  formatWeekdayDateManagua,
  managuaDateTimeToUtc,
  startOfWeekManagua,
  todayInManagua,
  weekNumberManagua,
  type ManaguaDateParts,
} from "@/lib/datetime";
import { Eyebrow } from "@/components/ui";
import { CalendarToolbar, type CalendarView } from "@/components/calendario/CalendarToolbar";

type PageProps = {
  searchParams: Promise<{ vista?: string; fecha?: string }>;
};

function isCalendarView(value: string | undefined): value is CalendarView {
  return value === "dia" || value === "semana" || value === "mes";
}

function isFechaFormat(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseFechaParam(value: string | undefined): ManaguaDateParts {
  if (!isFechaFormat(value)) return todayInManagua();
  const [year, month, day] = value.split("-").map(Number);
  const candidate = managuaDateTimeToUtc(year, month, day, 12, 0);
  if (Number.isNaN(candidate.getTime())) return todayInManagua();
  return { year, month, day };
}

function toFecha(parts: ManaguaDateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function periodLabel(vista: CalendarView, fecha: ManaguaDateParts): string {
  if (vista === "dia") {
    return formatWeekdayDateManagua(managuaDateTimeToUtc(fecha.year, fecha.month, fecha.day, 12, 0));
  }
  if (vista === "mes") {
    return formatMonthYearManagua(fecha);
  }
  const weekStart = startOfWeekManagua(fecha);
  const weekEnd = addDaysManagua(weekStart, 5);
  const weekEndInstant = managuaDateTimeToUtc(weekEnd.year, weekEnd.month, weekEnd.day, 12, 0);
  const weekNumber = weekNumberManagua(weekStart);
  return `Semana ${weekNumber} · ${weekStart.day}–${formatShortDateManagua(weekEndInstant)}`.toUpperCase();
}

export default async function CalendarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) return null;

  const vista: CalendarView = isCalendarView(params.vista) ? params.vista : "semana";
  const fecha = parseFechaParam(params.fecha);
  const fechaParam = toFecha(fecha);
  const todayFecha = toFecha(todayInManagua());

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-6xl md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{periodLabel(vista, fecha)}</Eyebrow>
          <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink md:text-3xl">
            Calendario
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CalendarToolbar vista={vista} fecha={fechaParam} todayFecha={todayFecha} />
          <Link
            href={`/app/calendario/nueva?fecha=${fechaParam}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ct-primary px-5 py-2.5 text-sm font-medium text-ct-primary-deep transition-colors hover:bg-ct-primary-soft"
          >
            Agendar
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-ct-border bg-ct-surface p-6 text-sm text-ct-ink-muted">
        Vista <strong className="text-ct-ink">{vista}</strong> para el periodo con fecha de referencia{" "}
        <strong className="text-ct-ink">{fechaParam}</strong>. La rejilla de citas se construye en los
        siguientes pasos del plan.
      </div>
    </div>
  );
}
