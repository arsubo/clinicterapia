type IconProps = {
  className?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function AgendaIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 5.5a3.25 3.25 0 0 1 0 6.4" />
      <path d="M15 14.2a5.5 5.5 0 0 1 5.5 5.8h-2.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function ActivityIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 12h4l2.2-6.5L13 18l2.5-6H21" />
    </svg>
  );
}

export function AlertsIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14.5 6 10.5Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 6.5h9" />
      <path d="M17 6.5h3" />
      <circle cx="14" cy="6.5" r="2.25" />
      <path d="M4 12h3" />
      <path d="M11 12h9" />
      <circle cx="8" cy="12" r="2.25" />
      <path d="M4 17.5h9" />
      <path d="M17 17.5h3" />
      <circle cx="14" cy="17.5" r="2.25" />
    </svg>
  );
}
