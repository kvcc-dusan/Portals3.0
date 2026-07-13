import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function PullQuote({ content, theme }: BlockProps) {
  const quote = content.quote;
  if (!quote) return null;

  const technical = theme === 'technical';

  if (technical) {
    return (
      <figure style={{ margin: 0, maxWidth: '100%', borderLeft: `2px solid ${PAGE.ink}`, paddingLeft: 24 }}>
        <blockquote
          style={{
            margin: 0,
            fontFamily: PAGE.display,
            fontWeight: 500,
            color: PAGE.ink,
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
            fontSize: 18,
          }}
        >
          {quote.text}
        </blockquote>
        {quote.attribution && (
          <figcaption
            style={{
              marginTop: 18,
              fontFamily: PAGE.body,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: PAGE.mute,
            }}
          >
            {quote.attribution}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure style={{ margin: 0, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', padding: '8px 20px' }}>
      <blockquote
        style={{
          margin: 0,
          fontFamily: PAGE.body,
          fontWeight: 400,
          color: PAGE.ink,
          lineHeight: 1.35,
          fontSize: 'clamp(24px, 3vw, 34px)',
        }}
      >
        “{quote.text}”
      </blockquote>
      {quote.attribution && (
        <figcaption
          style={{
            marginTop: 20,
            fontFamily: PAGE.body,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: PAGE.mute,
          }}
        >
          {quote.attribution}
        </figcaption>
      )}
    </figure>
  );
}
