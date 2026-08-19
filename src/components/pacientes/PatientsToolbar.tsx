"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PatientFilter } from "@/lib/patients";

type FilterOption = {
  value: PatientFilter;
  label: string;
  count: number;
};

type PatientsToolbarProps = {
  initialQuery: string;
  activeFilter: PatientFilter;
  counts: Record<PatientFilter, number>;
};

const FILTER_ORDER: { value: PatientFilter; label: string }[] = [
  { value: "activos", label: "Activos" },
  { value: "domicilio", label: "Domicilio" },
  { value: "alta", label: "Alta" },
];

export function PatientsToolbar({ initialQuery, activeFilter, counts }: PatientsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query === (searchParams.get("q") ?? "")) return;

      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function setFilter(filter: PatientFilter) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filterOptions: FilterOption[] = FILTER_ORDER.map((option) => ({
    ...option,
    count: counts[option.value],
  }));

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 rounded-full border border-ct-border bg-ct-surface px-4 py-2.5">
        <svg
          className="h-4 w-4 shrink-0 text-ct-ink-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o nº de expediente"
          className="w-full bg-transparent text-sm text-ct-ink outline-none placeholder:text-ct-ink-muted"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto">
        {filterOptions.map((option) => {
          const active = option.value === activeFilter;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-ct-primary bg-ct-primary-soft text-ct-primary-deep"
                  : "border-ct-border text-ct-ink-muted hover:bg-ct-bg-page"
              }`}
            >
              {option.label} · {option.count}
            </button>
          );
        })}
      </div>
    </div>
  );
}
