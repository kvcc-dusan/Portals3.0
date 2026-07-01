import { PAGE, eyebrowStyle } from './page-tokens';
import type { BlockProps } from './types';

export function Hero({ content, theme }: BlockProps) {
  const { eyebrow, title, subtitle, lead, heroImage } = content;
  const compact = theme === 'technical';
  const showImage = !!heroImage && theme !== 'technical';

  return (
    <header style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 18 }}>
        {eyebrow && <span style={eyebrowStyle}>{eyebrow}</span>}
        {title && (
          <h1
            style={{
              fontFamily: PAGE.display,
              fontWeight: 800,
              color: PAGE.ink,
              margin: 0,
              lineHeight: 0.95,
              letterSpacing: '0',
              textTransform: 'uppercase',
              fontSize: compact
                ? 'clamp(28px, 4vw, 44px)'
                : theme === 'editorial'
                  ? 'clamp(40px, 6.5vw, 76px)'
                  : 'clamp(34px, 5vw, 60px)',
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              fontFamily: PAGE.display,
              fontWeight: 500,
              fontSize: compact ? 17 : 22,
              color: PAGE.mute,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </p>
        )}
        {lead && (
          <p
            style={{
              fontFamily: PAGE.body,
              fontSize: compact ? 16 : 21,
              lineHeight: 1.55,
              color: PAGE.ink,
              margin: 0,
              maxWidth: 680,
              fontWeight: theme === 'editorial' ? 400 : 400,
            }}
          >
            {lead}
          </p>
        )}
      </div>

      {showImage && (
        <div
          style={{
            marginTop: 36,
            width: '100%',
            aspectRatio: theme === 'editorial' ? '16 / 9' : '21 / 9',
            overflow: 'hidden',
            background: PAGE.wash,
          }}
        >
          <img
            src={heroImage}
            alt={title ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {compact && <div style={{ marginTop: 24, height: 2, background: PAGE.ink, width: '100%' }} />}
    </header>
  );
}
