import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppointmentById } from "@/lib/appointments";
import { formatDateInputManagua, formatTimeManagua } from "@/lib/datetime";
import { Eyebrow } from "@/components/ui";
import { AppointmentForm } from "@/components/calendario/AppointmentForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarCitaPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) return null;

  const [appointment, patients] = await Promise.all([
    getAppointmentById(therapist.id, id),
    prisma.patient.findMany({
      where: { therapistId: therapist.id },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  if (!appointment) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link href="/app/calendario" className="text-sm text-ct-ink-muted hover:text-ct-primary-deep">
        ← Calendario
      </Link>
      <Eyebrow className="mt-4">Editar cita</Eyebrow>
      <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink">
        {appointment.patient.fullName}
      </h1>

      <div className="mt-6">
        <AppointmentForm
          patients={patients}
          appointment={{
            id: appointment.id,
            patientId: appointment.patientId,
            fecha: formatDateInputManagua(appointment.startsAt),
            hora: formatTimeManagua(appointment.startsAt),
            durationMin: appointment.durationMin,
            location: appointment.location,
            address: appointment.address,
            travelMin: appointment.travelMin,
            reasonLabel: appointment.reasonLabel,
          }}
        />
      </div>
    </div>
  );
}
