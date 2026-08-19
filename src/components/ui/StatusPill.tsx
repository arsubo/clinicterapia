import type { ReactNode } from "react";

type StatusPillTone = "neutral" | "primary" | "warn" | "outline";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
};

const toneClasses: Record<StatusPillTone, string> = {
  neutral: "bg-ct-bg-page text-ct-ink-muted",
  primary: "bg-ct-primary-soft text-ct-primary-deep",
  warn: "bg-ct-warn/15 text-ct-warn",
  outline: "border border-ct-primary text-ct-primary-deep",
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
