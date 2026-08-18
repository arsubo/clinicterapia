import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ct-border px-6 py-10 text-center">
      <p className="font-[family-name:var(--font-outfit)] text-base font-semibold text-ct-ink">
        {title}
      </p>
      {description && (
        <p className="max-w-xs text-sm text-ct-ink-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
