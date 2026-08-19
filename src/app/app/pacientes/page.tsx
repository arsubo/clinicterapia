import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listPatients, type PatientFilter } from "@/lib/patients";
import { Eyebrow, EmptyState } from "@/components/ui";
import { PatientsToolbar } from "@/components/pacientes/PatientsToolbar";
import { PatientRow } from "@/components/pacientes/PatientRow";

const FOLLOW_UP_ALERT_TYPES = new Set(["PAIN_INCREASE", "ROUTINE_NO_LOG"]);

type PageProps = {
  searchParams: Promise<{ q?: string; filter?: string }>;
};

function isPatientFilter(value: string | undefined): value is PatientFilter {
  return value === "activos" || value === "domicilio" || value === "alta";
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const therapist = await prisma.therapist.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!therapist) return null;

  const query = params.q?.trim() ?? "";
  const filter: PatientFilter = isPatientFilter(params.filter) ? params.filter : "activos";

  const [patients, activosCount, domicilioCount, altaCount] = await Promise.all([
    listPatients(therapist.id, { query, filter }),
    prisma.patient.count({ where: { therapistId: therapist.id, status: "ACTIVE" } }),
    prisma.patient.count({
      where: { therapistId: therapist.id, appointments: { some: { location: "HOME" } } },
    }),
    prisma.patient.count({ where: { therapistId: therapist.id, status: "DISCHARGED" } }),
  ]);

  const followUp = patients.filter((patient) =>
    patient.alerts.some((alert) => FOLLOW_UP_ALERT_TYPES.has(alert.type)),
  );
  const rest = patients.filter(
    (patient) => !patient.alerts.some((alert) => FOLLOW_UP_ALERT_TYPES.has(alert.type)),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-5xl md:px-8 md:py-8">
      <Eyebrow>Pacientes</Eyebrow>
      <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-ct-ink md:text-3xl">
        Pacientes
      </h1>

      <div className="mt-4">
        <PatientsToolbar
          initialQuery={query}
          activeFilter={filter}
          counts={{ activos: activosCount, domicilio: domicilioCount, alta: altaCount }}
        />
      </div>

      <div className="mt-6 space-y-8">
        {patients.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="Prueba con otro nombre, número de expediente o filtro."
          />
        ) : (
          <>
            {followUp.length > 0 && (
              <div className="space-y-3">
                <Eyebrow>Requieren seguimiento</Eyebrow>
                <div className="space-y-3">
                  {followUp.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div className="space-y-3">
                <Eyebrow>Todos · A-Z</Eyebrow>
                <div className="space-y-3">
                  {rest.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
