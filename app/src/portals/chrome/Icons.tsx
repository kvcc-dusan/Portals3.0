/** Minimal inline-SVG icon set for the tool chrome. Stroke inherits currentColor. */
type IconProps = { size?: number; className?: string };

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const Chevron = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M6 9l6 6 6-6" /></svg>
);
export const Plus = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>
);
export const ArrowUp = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
export const ArrowDown = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const Trash = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);
export const Undo = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-1" /></svg>
);
export const Redo = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M15 7l5 5-5 5M20 12H9a5 5 0 000 10h1" /></svg>
);
export const Eye = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Laptop = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><rect x="4" y="5" width="16" height="11" rx="1" /><path d="M2 20h20" /></svg>
);
export const Phone = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></svg>
);
export const Settings = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008.6 19a1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1A1.7 1.7 0 003.6 8.6a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H8a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V8a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
);
export const Sparkle = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>
);
export const Refresh = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" /></svg>
);
export const Close = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Link = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" /></svg>
);
export const Columns = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><rect x="3" y="4" width="8" height="16" rx="1" /><rect x="13" y="4" width="8" height="16" rx="1" /></svg>
);
export const Pencil = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
);
export const Info = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="10" /><path d="M12 11v6" /><path d="M12 7.5v.01" /></svg>
);
export const Globe = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 010 20 15 15 0 010-20z" /></svg>
);
export const Mail = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
