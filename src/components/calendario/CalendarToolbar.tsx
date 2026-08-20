"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { addDaysManagua, type ManaguaDateParts } from "@/lib/datetime";

export type CalendarView = "dia" | "semana" | "mes";

type CalendarToolbarProps = {
  vista: CalendarView;
  fecha: string;
  todayFecha: string;
};

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

function parseFecha(value: string): ManaguaDateParts {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function toFecha(parts: ManaguaDateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function shiftMonth(parts: ManaguaDateParts, delta: number): ManaguaDateParts {
  const totalMonths = parts.year * 12 + (parts.month - 1) + delta;
  return { year: Math.floor(totalMonths / 12), month: (totalMonths % 12) + 1, day: 1 };
}

export function CalendarToolbar({ vista, fecha, todayFecha }: CalendarToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(nextVista: CalendarView, nextFecha: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("vista", nextVista);
    params.set("fecha", nextFecha);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function step(delta: 1 | -1) {
    const parts = parseFecha(fecha);
    if (vista === "dia") return navigate(vista, toFecha(addDaysManagua(parts, delta)));
    if (vista === "semana") return navigate(vista, toFecha(addDaysManagua(parts, delta * 7)));
    return navigate(vista, toFecha(shiftMonth(parts, delta)));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-full border border-ct-border bg-ct-surface p-1">
        {VIEW_OPTIONS.map((option) => {
          const active = option.value === vista;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => navigate(option.value, fecha)}
              aria-current={active ? "true" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ct-primary-soft text-ct-primary-deep"
                  : "text-ct-ink-muted hover:text-ct-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Periodo anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ct-border text-ct-ink-muted transition-colors hover:bg-ct-bg-page hover:text-ct-ink"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => navigate(vista, todayFecha)}
          className="rounded-full border border-ct-border px-3.5 py-1.5 text-sm font-medium text-ct-ink transition-colors hover:bg-ct-bg-page"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Periodo siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ct-border text-ct-ink-muted transition-colors hover:bg-ct-bg-page hover:text-ct-ink"
        >
          ›
        </button>
      </div>
    </div>
  );
}
