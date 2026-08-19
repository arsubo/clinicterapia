import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPatientById } from "@/lib/patients";
import { Avatar } from "@/components/ui";
import { PatientTabs } from "@/components/pacientes/PatientTabs";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function PatientLayout({ children, params }: LayoutProps) {
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

  const subtitleParts = [
    patient.diagnosis,
    patient.age ? `${patient.age} años` : null,
    `nº ${patient.recordNo}`,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-5xl md:px-8 md:py-8">
      <div className="flex items-center gap-3">
        <Link
          href="/app/pacientes"
          aria-label="Volver a pacientes"
          className="shrink-0 text-ct-ink-muted transition-colors hover:text-ct-primary-deep"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5 8 12l7 7" />
          </svg>
        </Link>
        <Avatar initials={initials(patient.fullName)} tone="primary" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[family-name:var(--font-outfit)] text-xl font-semibold text-ct-ink md:text-2xl">
            {patient.fullName}
          </h1>
          <p className="truncate text-sm text-ct-ink-muted">{subtitleParts.join(" · ")}</p>
        </div>
        <Link
          href={`/app/pacientes/${patient.id}/editar`}
          aria-label="Editar paciente"
          className="shrink-0 rounded-full p-2 text-ct-ink-muted transition-colors hover:bg-ct-bg-page hover:text-ct-primary-deep"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        </Link>
      </div>

      <div className="mt-6">
        <PatientTabs patientId={patient.id} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
