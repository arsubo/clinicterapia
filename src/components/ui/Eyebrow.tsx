import type { HTMLAttributes } from "react";

export function Eyebrow({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.2em] text-ct-ink-muted ${className}`}
      {...props}
    />
  );
}
