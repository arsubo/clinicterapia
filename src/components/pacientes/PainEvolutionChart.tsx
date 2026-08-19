const PAIN_SCALE_MAX = 10;

type PainEvolutionChartProps = {
  sessions: { painScore: number | null }[];
};

export function PainEvolutionChart({ sessions }: PainEvolutionChartProps) {
  const withPain = sessions.filter(
    (session): session is { painScore: number } => session.painScore !== null,
  );

  return (
    <div className="flex h-32 items-end gap-2">
      {withPain.map((session, index) => {
        const isLast = index === withPain.length - 1;
        const heightPct = Math.max(6, (session.painScore / PAIN_SCALE_MAX) * 100);
        return (
          <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className={`w-full rounded-t-md ${isLast ? "bg-ct-primary" : "bg-ct-primary-soft"}`}
              style={{ height: `${heightPct}%` }}
            />
            <span
              className={`text-xs ${isLast ? "font-semibold text-ct-ink" : "text-ct-ink-muted"}`}
            >
              {session.painScore}
            </span>
          </div>
        );
      })}
    </div>
  );
}
