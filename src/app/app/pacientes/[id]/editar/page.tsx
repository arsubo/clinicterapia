import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPatientById } from "@/lib/patients";
import { formatDateInputManagua } from "@/lib/datetime";
import { Eyebrow } from "@/components/ui";
import { PatientForm } from "@/components/pacientes/PatientForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarPacientePage({ params }: PageProps) {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link
        href={`/app/pacientes/${patient.id}`}
        className="text-sm text-ct-ink-muted hover:text-ct-primary-deep"
      >
        ← {patient.fullName}
      </Link>
      <Eyebrow className="mt-4">Editar paciente</Eyebrow>
      <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink">
        {patient.fullName}
      </h1>

      <div className="mt-6">
        <PatientForm
          patient={{
            id: patient.id,
            fullName: patient.fullName,
            recordNo: patient.recordNo,
            age: patient.age,
            homeAddress: patient.homeAddress,
            status: patient.status,
            diagnosis: patient.diagnosis,
            phone: patient.phone,
            contactEmail: patient.contactEmail,
            plannedSessions: patient.plannedSessions,
            notes: patient.notes,
            startedAtInput: patient.startedAt ? formatDateInputManagua(patient.startedAt) : null,
          }}
        />
      </div>
    </div>
  );
}
