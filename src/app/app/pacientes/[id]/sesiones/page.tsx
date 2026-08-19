import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPatientById } from "@/lib/patients";
import { formatDateInputManagua, formatShortDateManagua, managuaDateTimeToUtc, todayInManagua } from "@/lib/datetime";
import { Card, EmptyState, Eyebrow } from "@/components/ui";
import { NewSessionForm } from "@/components/pacientes/NewSessionForm";
import { SessionNoteEditor } from "@/components/pacientes/SessionNoteEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SesionesTabPage({ params }: PageProps) {
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

  const sessionsDesc = [...patient.sessions].reverse();
  const nextSequenceNo = (patient.sessions.at(-1)?.sequenceNo ?? 0) + 1;
  const { year, month, day } = todayInManagua();
  const defaultDate = formatDateInputManagua(managuaDateTimeToUtc(year, month, day, 9, 0));

  return (
    <div className="space-y-6">
      <NewSessionForm
        patientId={patient.id}
        nextSequenceNo={nextSequenceNo}
        defaultDate={defaultDate}
      />

      {sessionsDesc.length === 0 ? (
        <EmptyState
          title="Sin sesiones registradas"
          description="Registra la primera sesión de este paciente con el botón de arriba."
        />
      ) : (
        <div className="space-y-3">
          {sessionsDesc.map((item) => (
            <Card key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow>
                  {formatShortDateManagua(item.occurredAt)} · Sesión {item.sequenceNo}
                </Eyebrow>
                <div className="flex items-center gap-3 text-sm text-ct-ink-muted">
                  {item.painScore != null && <span>Dolor {item.painScore}/10</span>}
                  {item.rotationDeg != null && <span>Rotación {item.rotationDeg}°</span>}
                </div>
              </div>
              <SessionNoteEditor sessionId={item.id} note={item.note} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
