type AvatarTone = "neutral" | "primary";
type AvatarSize = "sm" | "md";

type AvatarProps = {
  initials: string;
  tone?: AvatarTone;
  size?: AvatarSize;
};

const toneClasses: Record<AvatarTone, string> = {
  neutral: "bg-ct-bg-page text-ct-ink-muted",
  primary: "bg-ct-primary-soft text-ct-primary-deep",
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

export function Avatar({ initials, tone = "neutral", size = "md" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${toneClasses[tone]} ${sizeClasses[size]}`}
    >
      {initials}
    </span>
  );
}
