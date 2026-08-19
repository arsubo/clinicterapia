type StatTileProps = {
  label: string;
  value: string;
  caption?: string;
  trend?: string;
  progress?: number;
  tone?: "default" | "highlight";
};

export function StatTile({
  label,
  value,
  caption,
  trend,
  progress,
  tone = "default",
}: StatTileProps) {
  const toneClasses =
    tone === "highlight"
      ? "border-ct-primary/30 bg-ct-primary-soft"
      : "border-ct-border bg-ct-surface";

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <p className="text-sm text-ct-ink-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-outfit)] text-3xl font-semibold text-ct-ink">
          {value}
        </span>
        {trend && (
          <span className="text-sm font-medium text-ct-primary-deep">{trend}</span>
        )}
      </div>
      {caption && <p className="mt-1 text-xs text-ct-ink-muted">{caption}</p>}
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ct-bg-page">
          <div
            className="h-full rounded-full bg-ct-primary"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
