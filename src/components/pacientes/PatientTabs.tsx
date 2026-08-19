"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Resumen" },
  { slug: "sesiones", label: "Sesiones" },
  { slug: "sintomas", label: "Síntomas" },
  { slug: "rutina", label: "Rutina" },
  { slug: "citas", label: "Citas" },
];

export function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname();
  const base = `/app/pacientes/${patientId}`;

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-ct-border">
      {TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-ct-primary text-ct-primary-deep"
                : "border-transparent text-ct-ink-muted hover:text-ct-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
