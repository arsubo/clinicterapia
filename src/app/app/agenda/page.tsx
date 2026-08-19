import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatWeekdayDateManagua,
  managuaDateTimeToUtc,
  todayInManagua,
} from "@/lib/datetime";
import { averageAdherence, calculateRoutineAdherence } from "@/lib/adherence";
import { findFreeSlots, type Interval } from "@/lib/schedule";
import { listBlocksInRange } from "@/lib/appointments";
import { Eyebrow, StatTile, StatusPill } from "@/components/ui";
import { AppointmentRow } from "@/components/agenda/AppointmentRow";
import { AgendaSidePanel } from "@/components/agenda/AgendaSidePanel";
import { AppointmentActionsMenu } from "@/components/calendario/AppointmentActionsMenu";
import { BlockRow, FreeSlotRow } from "@/components/calendario/ScheduleRows";
import type { WeekBlock } from "@/components/calendario/WeekGrid";

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true },
  });

  if (!therapist) return null;

  const { year, month, day } = todayInManagua();
  const dayStart = managuaDateTimeToUtc(year, month, day, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [appointments, blocks, routines, alerts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        therapistId: therapist.id,
        startsAt: { gte: dayStart, lt: dayEnd },
      },
      include: { patient: { select: { id: true, fullName: true, homeAddress: true } } },
      orderBy: { startsAt: "asc" },
    }),
    listBlocksInRange(therapist.id, dayStart, dayEnd),
    prisma.routine.findMany({
      where: { patient: { therapistId: therapist.id } },
      include: { items: true, logs: true },
    }),
    prisma.alert.findMany({
      where: { therapistId: therapist.id, resolvedAt: null },
      select: { id: true, type: true, message: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const freeSlots = findFreeSlots(dayStart, appointments, blocks);

  type AgendaRow =
    | { kind: "appointment"; at: Date; data: (typeof appointments)[number] }
    | { kind: "block"; at: Date; data: WeekBlock }
    | { kind: "free"; at: Date; data: Interval };

  const agendaRows: AgendaRow[] = [
    ...appointments.map((data): AgendaRow => ({ kind: "appointment", at: data.startsAt, data })),
    ...blocks.map((data): AgendaRow => ({ kind: "block", at: data.startsAt, data })),
    ...freeSlots.map((data): AgendaRow => ({ kind: "free", at: data.start, data })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  const pendingAlertsCount = alerts.length;

  const nowAppointment = appointments.find(
    (appt) => appt.status !== "DONE" && appt.status !== "CANCELLED" && appt.status !== "NO_SHOW",
  );

  const doneCount = appointments.filter((appt) => appt.status === "DONE").length;
  const pendingCount = appointments.filter(
    (appt) => appt.status !== "DONE" && appt.status !== "CANCELLED" && appt.status !== "NO_SHOW",
  ).length;
  const homeCount = appointments.filter((appt) => appt.location === "HOME").length;
  const altasPrevistasCount = appointments.filter((appt) =>
    appt.reasonLabel.toLowerCase().includes("alta prevista"),
  ).length;

  const adherenceRates = routines
    .map((routine) => calculateRoutineAdherence(routine))
    .filter((rate): rate is number => rate !== null);
  const averageAdherencePct = averageAdherence(adherenceRates);

  const dateLabel = formatWeekdayDateManagua(appointments[0]?.startsAt ?? dayStart);
  const firstName = therapist.fullName.split(" ")[0];

  const homeAppointment = appointments.find((appt) => appt.location === "HOME");
  const homeVisit = homeAppointment
    ? {
        patientName: homeAppointment.patient.fullName,
        address:
          homeAppointment.address ?? homeAppointment.patient.homeAddress ?? "Sin dirección",
        startsAt: homeAppointment.startsAt,
        travelMin: homeAppointment.travelMin ?? 0,
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-5xl md:px-8 md:py-8">
      <div className="md:hidden">
        <Eyebrow>{dateLabel}</Eyebrow>
        <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink">
          Hoy · {appointments.length} sesiones
        </h1>
        <div className="mt-4 flex gap-2">
          <StatusPill tone="primary">Todas · {appointments.length}</StatusPill>
          <StatusPill tone="neutral">Pendientes · {pendingCount}</StatusPill>
          <StatusPill tone="neutral">Domicilio · {homeCount}</StatusPill>
        </div>
      </div>

      <div className="hidden md:block">
        <Eyebrow>
          {dateLabel} · {appointments.length} sesiones
          {homeCount > 0 ? ` · ${homeCount} domicilio` : ""}
        </Eyebrow>
        <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-semibold text-ct-ink">
          Buenos días, {firstName}
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            label="Sesiones hoy"
            value={String(appointments.length)}
            caption={`${doneCount} terminadas · ${nowAppointment ? 1 : 0} en curso`}
          />
          <StatTile
            label="Adherencia media"
            value={averageAdherencePct === null ? "—" : `${averageAdherencePct}%`}
            caption={averageAdherencePct === null ? "Sin datos todavía" : "esta semana"}
            progress={averageAdherencePct ?? undefined}
          />
          <StatTile label="Altas previstas" value={String(altasPrevistasCount)} caption="hoy" />
          <StatTile
            label="Requieren atención"
            value={String(pendingAlertsCount)}
            caption="alertas activas"
            tone={pendingAlertsCount > 0 ? "highlight" : "default"}
          />
        </div>
      </div>

      <div className="mt-6 md:grid md:grid-cols-3 md:items-start md:gap-6">
        <div className="space-y-3 md:col-span-2">
          {agendaRows.map((row, index) => {
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
          })}
        </div>

        <div className="mt-6 hidden md:mt-0 md:block">
          <AgendaSidePanel alerts={alerts} homeVisit={homeVisit} />
        </div>
      </div>
    </div>
  );
}
