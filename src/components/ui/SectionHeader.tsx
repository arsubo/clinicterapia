import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-ct-ink">
        {title}
      </h2>
      {action}
    </div>
  );
}
