import Link from "next/link";
import { Avatar, Card } from "@/components/ui";
import {
  formatShortWeekdayManagua,
  formatTimeManagua,
  isSameDayManagua,
  todayInManagua,
} from "@/lib/datetime";

type PatientRowData = {
  id: string;
  fullName: string;
  diagnosis: string | null;
  plannedSessions: number | null;
  sessions: { painScore: number | null; sequenceNo: number }[];
  appointments: { startsAt: Date }[];
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function painTrend(sessions: { painScore: number | null }[]) {
  const latest = sessions[0]?.painScore ?? null;
  if (latest === null) return null;
  const previous = sessions[1]?.painScore ?? null;
  if (previous === null) return { value: latest, arrow: null };
  if (latest > previous) return { value: latest, arrow: "up" as const };
  if (latest < previous) return { value: latest, arrow: "down" as const };
  return { value: latest, arrow: "flat" as const };
}

const TREND_LABEL: Record<"up" | "down" | "flat", string> = {
  up: "↑",
  down: "↓",
  flat: "–",
};

const TREND_TONE: Record<"up" | "down" | "flat", string> = {
  up: "text-ct-warn",
  down: "text-ct-primary-deep",
  flat: "text-ct-ink-muted",
};

export function PatientRow({ patient }: { patient: PatientRowData }) {
  const trend = painTrend(patient.sessions);
  const latestSequenceNo = patient.sessions[0]?.sequenceNo;
  const nextAppointment = patient.appointments[0] ?? null;

  const nextAppointmentLabel = nextAppointment
    ? isSameDayManagua(nextAppointment.startsAt, todayInManagua())
      ? `hoy ${formatTimeManagua(nextAppointment.startsAt)}`
      : `${formatShortWeekdayManagua(nextAppointment.startsAt)} ${formatTimeManagua(nextAppointment.startsAt)}`
    : "sin cita";

  return (
    <Link href={`/app/pacientes/${patient.id}`}>
      <Card className="flex items-center gap-3 transition-colors hover:border-ct-primary/40">
        <Avatar initials={initials(patient.fullName)} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-[family-name:var(--font-outfit)] text-base font-semibold text-ct-ink">
            {patient.fullName}
          </p>
          <p className="truncate text-sm text-ct-ink-muted">
            {patient.diagnosis ?? "Sin diagnóstico"}
            {latestSequenceNo && patient.plannedSessions
              ? ` · ${latestSequenceNo} de ${patient.plannedSessions}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {trend && (
            <span className="font-mono text-sm text-ct-ink">
              {trend.value}{" "}
              <span className={TREND_TONE[trend.arrow ?? "flat"]}>
                {trend.arrow ? TREND_LABEL[trend.arrow] : ""}
              </span>
            </span>
          )}
          <span className="text-xs text-ct-ink-muted">{nextAppointmentLabel}</span>
        </div>
      </Card>
    </Link>
  );
}
