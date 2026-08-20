"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AppointmentStatus } from "@prisma/client";
import { deleteAppointment, setAppointmentStatus } from "@/app/app/calendario/actions";

type AppointmentActionsMenuProps = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
};

const STATUS_ACTIONS: { status: AppointmentStatus; label: string }[] = [
  { status: "CONFIRMED", label: "Confirmar" },
  { status: "DONE", label: "Terminada" },
  { status: "NO_SHOW", label: "No asistió" },
  { status: "CANCELLED", label: "Cancelar" },
];

export function AppointmentActionsMenu({ appointmentId, currentStatus }: AppointmentActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function applyStatus(status: AppointmentStatus) {
    setOpen(false);
    startTransition(async () => {
      await setAppointmentStatus(appointmentId, status);
    });
  }

  function handleDelete() {
    setOpen(false);
    if (!window.confirm("¿Eliminar esta cita? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deleteAppointment(appointmentId);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Acciones de la cita"
        disabled={pending}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ct-ink-muted transition-colors hover:bg-ct-bg-page hover:text-ct-ink disabled:opacity-40"
      >
        ⋮
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ct-border bg-ct-surface py-1 shadow-lg">
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action.status}
                type="button"
                onClick={() => applyStatus(action.status)}
                disabled={currentStatus === action.status}
                className="block w-full px-3 py-2 text-left text-sm text-ct-ink hover:bg-ct-bg-page disabled:cursor-not-allowed disabled:text-ct-ink-muted"
              >
                {action.label}
              </button>
            ))}
            <div className="my-1 border-t border-ct-border" />
            <Link
              href={`/app/calendario/${appointmentId}/editar`}
              className="block px-3 py-2 text-sm text-ct-ink hover:bg-ct-bg-page"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
