import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPatientById } from "@/lib/patients";
import { listPatientAppointments } from "@/lib/appointments";
import { Eyebrow, EmptyState } from "@/components/ui";
import { AppointmentRow } from "@/components/agenda/AppointmentRow";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CitasTabPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) return null;

  const patient = await getPatientById(therapist.id, id);
  if (!patient) notFound();

  const appointments = await listPatientAppointments(therapist.id, id);
  const now = new Date();
  const proximas = appointments.filter((appt) => appt.startsAt >= now);
  const pasadas = [...appointments.filter((appt) => appt.startsAt < now)].reverse();

  return (
    <div className="space-y-6">
      <Link
        href={`/app/calendario/nueva?paciente=${patient.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-ct-primary px-5 py-2.5 text-sm font-medium text-ct-primary-deep transition-colors hover:bg-ct-primary-soft"
      >
        Agendar
      </Link>

      {appointments.length === 0 ? (
        <EmptyState
          title="Sin citas"
          description="Agenda la primera cita de este paciente con el botón de arriba."
        />
      ) : (
        <>
          <div className="space-y-3">
            <Eyebrow>Próximas</Eyebrow>
            {proximas.length === 0 ? (
              <p className="text-sm text-ct-ink-muted">Sin citas próximas.</p>
            ) : (
              <div className="space-y-3">
                {proximas.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    patientId={patient.id}
                    patientName={patient.fullName}
                    reasonLabel={appt.reasonLabel}
                    startsAt={appt.startsAt}
                    status={appt.status}
                    location={appt.location}
                    isNow={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Eyebrow>Pasadas</Eyebrow>
            {pasadas.length === 0 ? (
              <p className="text-sm text-ct-ink-muted">Sin citas pasadas.</p>
            ) : (
              <div className="space-y-3">
                {pasadas.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    patientId={patient.id}
                    patientName={patient.fullName}
                    reasonLabel={appt.reasonLabel}
                    startsAt={appt.startsAt}
                    status={appt.status}
                    location={appt.location}
                    isNow={false}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
