import { PAGE, eyebrowStyle, headingStyle } from './page-tokens';
import type { BlockProps } from './types';

/**
 * The image variant is rendered full-bleed by PageRenderer (escapes <main>),
 * so this component never applies its own max-width/gutter wrapper — it
 * always inherits containment from whatever parent placed it (the page's
 * <main>, or, for the image banner, nothing at all).
 */
export function Hero({ content, theme }: BlockProps) {
  const { eyebrow, title, subtitle, lead, heroImage } = content;
  const compact = theme === 'technical';
  const showImage = !!heroImage && !compact;

  return (
    <header style={{ display: 'flex', flexDirection: 'column' }}>
      {showImage && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: theme === 'editorial' ? '2.35 / 1' : '3 / 1',
            overflow: 'hidden',
            background: PAGE.wash,
          }}
        >
          <img
            src={heroImage}
            alt={title ?? ''}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0) 55%)',
            }}
          />
          {eyebrow && (
            <div style={{ position: 'absolute', top: 20, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: PAGE.body, fontSize: 12, color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3 }}>Home</span>
              <span style={{ fontFamily: PAGE.body, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>/</span>
              <span style={{ fontFamily: PAGE.body, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{eyebrow}</span>
            </div>
          )}
          {title && (
            <h1 style={{ ...headingStyle(1), position: 'absolute', bottom: 24, left: 32, right: 32, color: '#fff' }}>
              {title}
            </h1>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 18, marginTop: showImage ? 40 : 0 }}>
        {!showImage && eyebrow && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: PAGE.body, fontSize: 12, color: PAGE.ink, textDecoration: 'underline', textUnderlineOffset: 3 }}>Home</span>
            <span style={eyebrowStyle}>/ {eyebrow}</span>
          </span>
        )}

        {!showImage && title && <h1 style={headingStyle(1)}>{title}</h1>}

        {subtitle && (
          <p
            style={{
              fontFamily: PAGE.body,
              fontWeight: 700,
              fontSize: compact ? 14 : 16,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: PAGE.mute,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}

        {lead && (
          <p
            style={{
              fontFamily: PAGE.body,
              fontWeight: 400,
              fontSize: compact ? 17 : 'clamp(22px, 3vw, 34px)',
              lineHeight: compact ? 1.5 : 1.4,
              color: PAGE.ink,
              margin: 0,
              maxWidth: compact ? 680 : 860,
            }}
          >
            {lead}
          </p>
        )}
      </div>

      {!showImage && <div style={{ marginTop: compact ? 24 : 32, height: 2, background: PAGE.ink, width: '100%' }} />}
    </header>
  );
}
