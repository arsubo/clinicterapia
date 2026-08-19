import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "surface" | "highlight";
};

export function Card({ tone = "surface", className = "", ...props }: CardProps) {
  const toneClasses =
    tone === "highlight"
      ? "border-ct-primary/30 bg-ct-primary-soft"
      : "border-ct-border bg-ct-surface";

  return (
    <div className={`rounded-xl border p-4 ${toneClasses} ${className}`} {...props} />
  );
}
