import { formatTimeManagua } from "@/lib/datetime";
import type { Interval } from "@/lib/schedule";
import type { WeekBlock } from "@/components/calendario/WeekGrid";

export function FreeSlotRow({ interval }: { interval: Interval }) {
  const minutes = Math.round((interval.end.getTime() - interval.start.getTime()) / 60000);
  return (
    <div className="rounded-xl border border-dashed border-ct-border p-4 text-sm text-ct-ink-muted">
      <span className="font-mono text-xs">{formatTimeManagua(interval.start)}</span> · Hueco libre · {minutes} min
    </div>
  );
}

export function BlockRow({ block }: { block: WeekBlock }) {
  return (
    <div className="rounded-xl border border-dashed border-ct-border bg-ct-bg-page p-4">
      <p className="font-mono text-xs text-ct-ink-muted">{formatTimeManagua(block.startsAt)}</p>
      <p className="text-sm font-medium text-ct-ink">{block.label}</p>
    </div>
  );
}
