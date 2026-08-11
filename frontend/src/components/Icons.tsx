/**
 * Shared SVG icon set for NAMO Jan Connect.
 * All icons render at 20×20 by default; pass size/color props to override.
 */

type IconProps = { size?: number; color?: string; className?: string };
const d = (size: number, color: string) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

/** 📍 Map pin / location */
export function IconPin({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.25" />
    </svg>
  );
}

/** 🔖 Ticket / tracking ID */
export function IconTicket({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-5V9z" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

/** 📡 Signal / routing */
export function IconSignal({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M5.636 5.636a9 9 0 1 0 12.728 0" />
      <path d="M8.464 8.464a5 5 0 1 0 7.072 0" />
      <circle cx="12" cy="13" r="1.5" fill={color} stroke="none" />
      <line x1="12" y1="14.5" x2="12" y2="21" />
    </svg>
  );
}

/** ⏱ Clock / SLA timer */
export function IconClock({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14.5" />
    </svg>
  );
}

/** 🔄 Refresh / status updates */
export function IconRefresh({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M4 4v5h5" />
      <path d="M20 20v-5h-5" />
      <path d="M4.93 9A9 9 0 0 1 19.07 15" />
      <path d="M19.07 15A9 9 0 0 1 4.93 9" strokeDasharray="1 0" />
      <path d="M4 9c0 0 1.5-3 5-4.5" />
      <path d="M20 15c0 0-1.5 3-5 4.5" />
    </svg>
  );
}

/** 📸 Camera / evidence photo */
export function IconCamera({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

/** 🔍 Search / transparency */
export function IconSearch({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** 🛡 Shield / privacy */
export function IconShield({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C18.25 22.15 21 17.25 21 12V6l-9-4z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/** ⚡ Lightning / speed */
export function IconBolt({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

/** 📊 Bar chart / accountability */
export function IconBarChart({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

/** 🔒 Lock / privacy preserved */
export function IconLock({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill={color} stroke="none" />
    </svg>
  );
}

/** ✓ Check / resolved badge */
export function IconCheck({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** → Arrow right */
export function IconArrowRight({ size = 16, color = "currentColor", className }: IconProps) {
  return (
    <svg {...d(size, color)} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
