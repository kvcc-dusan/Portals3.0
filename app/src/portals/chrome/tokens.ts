/**
 * Tool chrome tokens — the dark system, matched to the locked Portals prototype
 * (app/src/AltTextTest.tsx). Do NOT apply these to rendered pages.
 */
import type { CSSProperties } from 'react';

export const TOOL = {
  bg: '#0f0f0f',
  panel: '#000000',
  border: '#181818',
  borderSoft: 'rgba(255,255,255,0.04)',
  primary: '#f7f7f7',
  content: '#d2d2d2',
  mute: '#727272',
  faint: '#505050',
  accent: '#5314ff',
  error: '#e05c5c',
} as const;

const FEATURES = "'ss01' 1, 'cv01' 1, 'cv11' 1";

/** adidasFG — the brand sans, used across the whole tool chrome. */
export const ui = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: "'adidasFG', system-ui, sans-serif",
  fontFeatureSettings: FEATURES,
  ...extra,
});

/** Monospace meta — node ids, type badges, binding chips, breadcrumb meta. */
export const mono = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  ...extra,
});

/** Uppercase muted section label. */
export const label = (extra: CSSProperties = {}): CSSProperties =>
  ui({ fontSize: 12, textTransform: 'uppercase', color: TOOL.mute, letterSpacing: '0.02em', ...extra });
