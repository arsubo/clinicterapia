"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ComponentType, ReactNode } from "react";
import { Avatar } from "@/components/ui";
import {
  ActivityIcon,
  AgendaIcon,
  AlertsIcon,
  CalendarIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  inMobileBar: boolean;
  showsAlertBadge?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/app/agenda", label: "Agenda", icon: AgendaIcon, inMobileBar: true },
  { href: "/app/pacientes", label: "Pacientes", icon: UsersIcon, inMobileBar: true },
  { href: "/app/calendario", label: "Calendario", icon: CalendarIcon, inMobileBar: true },
  { href: "/app/rutinas", label: "Rutinas", icon: ActivityIcon, inMobileBar: false },
  {
    href: "/app/alertas",
    label: "Alertas",
    icon: AlertsIcon,
    inMobileBar: true,
    showsAlertBadge: true,
  },
  { href: "/app/ajustes", label: "Ajustes", icon: SettingsIcon, inMobileBar: true },
];

type AppShellProps = {
  children: ReactNode;
  pendingAlertsCount: number;
  therapistName: string;
};

export function AppShell({ children, pendingAlertsCount, therapistName }: AppShellProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-ct-bg-page md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto bg-ct-rail-dark px-4 py-6 md:flex">
        <div className="px-2">
          <p className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-white">
            Pauta
          </p>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ct-primary">
            Consulta Ferrer
          </p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-ct-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
                {item.showsAlertBadge && pendingAlertsCount > 0 && (
                  <span className="rounded-full bg-ct-primary-soft px-2 py-0.5 text-xs font-semibold text-ct-primary-deep">
                    {pendingAlertsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {therapistName && (
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
            <Avatar initials={initials(therapistName)} tone="primary" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{therapistName}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/acceso" })}
                className="text-xs text-white/60 transition-colors hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {therapistName && (
          <header className="flex items-center justify-between border-b border-ct-border bg-ct-surface px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <Avatar initials={initials(therapistName)} tone="primary" size="sm" />
              <span className="truncate text-sm font-medium text-ct-ink">{therapistName}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/acceso" })}
              className="text-xs font-medium text-ct-ink-muted transition-colors hover:text-ct-primary-deep"
            >
              Cerrar sesión
            </button>
          </header>
        )}

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-ct-border bg-ct-surface px-2 py-2 md:hidden">
          {NAV_ITEMS.filter((item) => item.inMobileBar).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium ${
                  active ? "text-ct-primary-deep" : "text-ct-ink-muted"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {item.showsAlertBadge && pendingAlertsCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-ct-primary" />
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
