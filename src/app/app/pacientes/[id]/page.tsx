import type { AlertType } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPatientById } from "@/lib/patients";
import { calculateRoutineAdherence } from "@/lib/adherence";
import { formatShortDateManagua } from "@/lib/datetime";
import { Card, EmptyState, Eyebrow, StatTile } from "@/components/ui";
import { PainEvolutionChart } from "@/components/pacientes/PainEvolutionChart";

type PageProps = {
  params: Promise<{ id: string }>;
};

const ALERT_LABEL: Record<AlertType, string> = {
  UNCONFIRMED_APPOINTMENT: "Cita sin confirmar",
  ROUTINE_NO_LOG: "Rutina sin registrar",
  PAIN_INCREASE: "Dolor al alza",
  DISCHARGE_DUE: "Alta pendiente",
};

function painTrendArrow(sessions: { painScore: number | null }[]) {
  const latest = sessions.at(-1)?.painScore ?? null;
  const previous = sessions.at(-2)?.painScore ?? null;
  if (latest === null || previous === null) return undefined;
  if (latest > previous) return "↑";
  if (latest < previous) return "↓";
  return "–";
}

export default async function ResumenTabPage({ params }: PageProps) {
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

  const lastSession = patient.sessions.at(-1) ?? null;
  const routine = patient.routines[0] ?? null;
  const adherence = routine ? calculateRoutineAdherence(routine) : null;
  const activeAlert = patient.alerts[0] ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label="Dolor"
            value={lastSession?.painScore != null ? String(lastSession.painScore) : "—"}
            trend={painTrendArrow(patient.sessions)}
          />
          <StatTile
            label="Sesión"
            value={
              lastSession && patient.plannedSessions
                ? `${lastSession.sequenceNo}/${patient.plannedSessions}`
                : lastSession
                  ? String(lastSession.sequenceNo)
                  : "—"
            }
          />
          <StatTile
            label="Rutina"
            value={adherence !== null ? `${adherence}%` : "—"}
            caption={adherence !== null ? "adherencia" : "sin rutina asignada"}
            progress={adherence ?? undefined}
          />
        </div>

        <Card>
          <Eyebrow>Evolución del dolor</Eyebrow>
          {patient.sessions.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Sin sesiones registradas"
                description="El gráfico aparecerá cuando el paciente tenga al menos una sesión."
              />
            </div>
          ) : (
            <div className="mt-4">
              <PainEvolutionChart sessions={patient.sessions} />
            </div>
          )}
        </Card>

        {lastSession?.note && (
          <Card className="space-y-1.5">
            <Eyebrow>Última sesión · {formatShortDateManagua(lastSession.occurredAt)}</Eyebrow>
            <p className="text-sm text-ct-ink">{lastSession.note}</p>
          </Card>
        )}
      </div>

      {activeAlert && (
        <div>
          <Card tone="highlight" className="space-y-2">
            <Eyebrow>Alerta activa</Eyebrow>
            <p className="text-sm text-ct-ink">
              <span className="font-medium">{ALERT_LABEL[activeAlert.type]}:</span>{" "}
              {activeAlert.message}
            </p>
            <span
              aria-disabled="true"
              title="Disponible en una spec futura"
              className="inline-block cursor-not-allowed text-sm font-medium text-ct-primary-deep/50"
            >
              Ver el mapa →
            </span>
          </Card>
        </div>
      )}
    </div>
  );
}
