import type { AlertType } from "@prisma/client";
import { Card, EmptyState, SectionHeader } from "@/components/ui";
import { formatTimeManagua } from "@/lib/datetime";

type AlertItem = {
  id: string;
  type: AlertType;
  message: string;
};

type HomeVisit = {
  patientName: string;
  address: string;
  startsAt: Date;
  travelMin: number;
};

type AgendaSidePanelProps = {
  alerts: AlertItem[];
  homeVisit: HomeVisit | null;
};

const ALERT_LABEL: Record<AlertType, string> = {
  UNCONFIRMED_APPOINTMENT: "Cita sin confirmar",
  ROUTINE_NO_LOG: "Rutina sin registrar",
  PAIN_INCREASE: "Dolor al alza",
  DISCHARGE_DUE: "Alta pendiente",
};

const URGENT_ALERT_TYPES: AlertType[] = ["UNCONFIRMED_APPOINTMENT", "PAIN_INCREASE"];

function AlertMarker({ urgent }: { urgent: boolean }) {
  return (
    <span
      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        urgent ? "bg-ct-warn/15 text-ct-warn" : "bg-ct-primary-soft text-ct-primary-deep"
      }`}
    >
      !
    </span>
  );
}

export function AgendaSidePanel({ alerts, homeVisit }: AgendaSidePanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader title="Requiere atención" />
        {alerts.length === 0 ? (
          <EmptyState title="Sin alertas pendientes" description="Todo al día por ahora." />
        ) : (
          <ul className="mt-4 space-y-4">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start gap-3">
                <AlertMarker urgent={URGENT_ALERT_TYPES.includes(alert.type)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ct-ink">{ALERT_LABEL[alert.type]}</p>
                  <p className="text-xs text-ct-ink-muted">{alert.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionHeader title="Visita a domicilio" />
        {!homeVisit ? (
          <EmptyState title="Sin visitas a domicilio hoy" />
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-ct-border text-center text-xs text-ct-ink-muted">
              Mapa de ruta
              <br />
              Consulta → {homeVisit.address}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ct-ink">{homeVisit.patientName}</p>
                <p className="font-mono text-xs text-ct-ink-muted">
                  {formatTimeManagua(homeVisit.startsAt)}
                </p>
              </div>
              <span className="text-xs text-ct-ink-muted">{homeVisit.travelMin} min</span>
            </div>
            <div className="rounded-full border border-ct-primary px-3 py-1.5 text-center text-sm font-medium text-ct-primary-deep">
              Salir a las{" "}
              {formatTimeManagua(
                new Date(homeVisit.startsAt.getTime() - homeVisit.travelMin * 60000),
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
