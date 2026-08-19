"use client";

import { useRef, useState, type ReactNode } from "react";
import { rescheduleAppointment } from "@/app/app/calendario/actions";
import { SLOT_MIN } from "@/lib/schedule";

// 2px de arrastre vertical = 1 minuto; se ajusta a SLOT_MIN al soltar.
const PX_PER_MINUTE = 2;
const DRAG_THRESHOLD_PX = 6;

export type DayDropTarget = { fecha: string; el: HTMLElement };

type DraggableChipProps = {
  appointmentId: string;
  fecha: string;
  hora: string;
  getDayTargets?: () => DayDropTarget[];
  children: ReactNode;
  className?: string;
};

function snapToSlot(minutes: number): number {
  return Math.round(minutes / SLOT_MIN) * SLOT_MIN;
}

function addMinutesToHora(hora: string, deltaMinutes: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = (((h * 60 + m + deltaMinutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function DraggableChip({ appointmentId, fecha, hora, getDayTargets, children, className }: DraggableChipProps) {
  const [drag, setDrag] = useState<{ fecha: string; hora: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  function resolveTargetFecha(clientX: number): string {
    const targets = getDayTargets?.();
    if (!targets || targets.length === 0) return fecha;
    for (const target of targets) {
      const rect = target.el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return target.fecha;
    }
    return fecha;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    startRef.current = { x: event.clientX, y: event.clientY };
    draggingRef.current = false;
    // Puede lanzar si el navegador no reconoce el pointerId (p. ej. eventos
    // sintéticos en pruebas); no es fatal para el resto del gesto.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // noop
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;

    if (!draggingRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      draggingRef.current = true;
    }

    event.preventDefault();
    setError(null);
    const deltaMinutes = snapToSlot(dy / PX_PER_MINUTE);
    setDrag({ fecha: resolveTargetFecha(event.clientX), hora: addMinutesToHora(hora, deltaMinutes) });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const wasDragging = draggingRef.current;
    startRef.current = null;
    draggingRef.current = false;
    if (!wasDragging) return;

    event.preventDefault();
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    const drop = drag;
    setDrag(null);
    if (!drop || (drop.fecha === fecha && drop.hora === hora)) return;

    rescheduleAppointment(appointmentId, drop.fecha, drop.hora).then((result) => {
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 4000);
      }
    });
  }

  function handlePointerCancel() {
    startRef.current = null;
    draggingRef.current = false;
    setDrag(null);
  }

  function handleClickCapture(event: React.MouseEvent) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      style={{ touchAction: "none" }}
      className={`relative ${drag ? "opacity-60" : ""} ${className ?? ""}`}
    >
      {children}
      {drag && (
        <div className="pointer-events-none absolute -top-6 left-0 z-30 whitespace-nowrap rounded-full bg-ct-ink px-2 py-0.5 text-[11px] text-white shadow-lg">
          {drag.hora}
        </div>
      )}
      {error && (
        <div className="pointer-events-none absolute -bottom-6 left-0 z-30 whitespace-nowrap rounded-full bg-red-600 px-2 py-0.5 text-[11px] text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
