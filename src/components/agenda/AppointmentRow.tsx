import Link from "next/link";
import type { AppointmentLocation, AppointmentStatus } from "@prisma/client";
import { Avatar, Button, Card, StatusPill } from "@/components/ui";
import { formatTimeManagua } from "@/lib/datetime";

type AppointmentRowProps = {
  patientId: string;
  patientName: string;
  reasonLabel: string;
  startsAt: Date;
  status: AppointmentStatus;
  location: AppointmentLocation;
  isNow: boolean;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  UNCONFIRMED: "Sin confirmar",
  DONE: "Hecha",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-ct-primary-deep"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </svg>
  );
}

export function AppointmentRow({
  patientId,
  patientName,
  reasonLabel,
  startsAt,
  status,
  location,
  isNow,
}: AppointmentRowProps) {
  const statusMarker =
    location === "HOME" ? (
      <StatusPill tone="primary">Domicilio</StatusPill>
    ) : status === "DONE" ? (
      <CheckIcon />
    ) : status === "NO_SHOW" ? (
      <StatusPill tone="warn">{STATUS_LABEL[status]}</StatusPill>
    ) : status === "CONFIRMED" || status === "UNCONFIRMED" ? (
      <StatusPill tone="primary">{STATUS_LABEL[status]}</StatusPill>
    ) : (
      <StatusPill tone="neutral">{STATUS_LABEL[status]}</StatusPill>
    );

  return (
    <Card tone={isNow ? "highlight" : "surface"} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar initials={initials(patientName)} tone={isNow ? "primary" : "neutral"} />
        <div className="min-w-0 flex-1">
          {isNow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ct-primary-deep">
              Ahora · {formatTimeManagua(startsAt)}
            </p>
          )}
          <Link
            href={`/app/pacientes/${patientId}`}
            className="block truncate font-[family-name:var(--font-outfit)] text-base font-semibold text-ct-ink hover:text-ct-primary-deep hover:underline"
          >
            {patientName}
          </Link>
          <p className="truncate text-sm text-ct-ink-muted">{reasonLabel}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {!isNow && (
            <span className="font-mono text-sm text-ct-ink">{formatTimeManagua(startsAt)}</span>
          )}
          {statusMarker}
        </div>
      </div>

      {isNow && (
        <div className="flex gap-2 pl-[52px]">
          <Link
            href={`/app/pacientes/${patientId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ct-primary px-3 py-1.5 text-sm font-medium text-ct-primary-deep transition-colors hover:bg-ct-primary-soft"
          >
            Abrir ficha
          </Link>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled
            title="Disponible en una spec futura"
          >
            Registrar dolor
          </Button>
        </div>
      )}
    </Card>
  );
}
