/**
 * Rendered-page design tokens. A SEPARATE visual language from the dark tool
 * chrome — light, corporate, adidas-group.com-style. Nothing here should
 * reference the tool's dark system.
 */
import type { ThemeId } from '../../types';

export const PAGE = {
  ink: '#000000',
  paper: '#ffffff',
  mute: '#767677',
  faint: '#a0a0a0',
  line: '#d9d9d9',
  wash: '#f3f3f3',
  display: "'adidasFG Compressed', 'adidasFG', system-ui, sans-serif",
  body: "'adidasFG', system-ui, sans-serif",
} as const;

/** Horizontal page gutter / max content width per theme density. */
export const layoutFor = (theme: ThemeId) => {
  switch (theme) {
    case 'editorial':
      return { maxWidth: 820, gutter: 40, sectionGap: 88 };
    case 'technical':
      return { maxWidth: 1080, gutter: 48, sectionGap: 48 };
    case 'index':
      return { maxWidth: 1080, gutter: 48, sectionGap: 72 };
  }
};

export const eyebrowStyle: React.CSSProperties = {
  fontFamily: PAGE.body,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: PAGE.mute,
};

/**
 * The adidas-group.com heading voice: adidasFG bold, uppercase, wide tracking.
 * Every heading role in the render layer should come from here, not be
 * authored ad hoc per block.
 */
export const headingStyle = (level: 1 | 2 | 3 | 4): React.CSSProperties => {
  const base: React.CSSProperties = {
    fontFamily: PAGE.display,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: PAGE.ink,
    margin: 0,
  };
  switch (level) {
    case 1:
      return { ...base, fontSize: 'clamp(34px, 4.5vw, 46px)', lineHeight: 1.05, letterSpacing: '3.5px' };
    case 2:
      return { ...base, fontSize: 'clamp(28px, 3.5vw, 38px)', lineHeight: 1.06, letterSpacing: '3px' };
    case 3:
      return { ...base, fontSize: 24, lineHeight: 1.15, letterSpacing: '2.5px' };
    case 4:
      return { ...base, fontSize: 15, lineHeight: 1.3, letterSpacing: '2px' };
  }
};
