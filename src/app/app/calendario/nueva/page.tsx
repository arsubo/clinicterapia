import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/ui";
import { AppointmentForm } from "@/components/calendario/AppointmentForm";

type PageProps = {
  searchParams: Promise<{ fecha?: string; hora?: string; paciente?: string }>;
};

export default async function NuevaCitaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) return null;

  const patients = await prisma.patient.findMany({
    where: { therapistId: therapist.id },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link href="/app/calendario" className="text-sm text-ct-ink-muted hover:text-ct-primary-deep">
        ← Calendario
      </Link>
      <Eyebrow className="mt-4">Nueva cita</Eyebrow>
      <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink">
        Agendar cita
      </h1>

      <div className="mt-6">
        <AppointmentForm
          patients={patients}
          defaultFecha={params.fecha}
          defaultHora={params.hora}
          defaultPatientId={params.paciente}
        />
      </div>
    </div>
  );
}
