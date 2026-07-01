/**
 * Rendered-page design tokens. A SEPARATE visual language from the dark tool
 * chrome — light, corporate, adidas-style. Nothing here should reference the
 * tool's dark system.
 */
import type { ThemeId } from '../../types';

export const PAGE = {
  ink: '#0a0a0a',
  paper: '#ffffff',
  mute: '#6b6b6b',
  faint: '#9a9a9a',
  line: '#e4e4e4',
  wash: '#f4f4f3',
  display: "'adidasFG Compressed', 'adidasFG', system-ui, sans-serif",
  body: "'adidasFG', system-ui, sans-serif",
} as const;

/** Horizontal page gutter / max content width per theme density. */
export const layoutFor = (theme: ThemeId) => {
  switch (theme) {
    case 'editorial':
      return { maxWidth: 760, gutter: 40, sectionGap: 72 };
    case 'technical':
      return { maxWidth: 1080, gutter: 48, sectionGap: 40 };
    case 'index':
      return { maxWidth: 1080, gutter: 48, sectionGap: 56 };
  }
};

export const eyebrowStyle: React.CSSProperties = {
  fontFamily: PAGE.body,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: PAGE.mute,
};
