import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function PullQuote({ content, theme }: BlockProps) {
  const quote = content.quote;
  if (!quote) return null;

  const technical = theme === 'technical';

  return (
    <figure
      style={{
        margin: 0,
        maxWidth: theme === 'editorial' ? 860 : '100%',
        borderLeft: technical ? `3px solid ${PAGE.ink}` : 'none',
        paddingLeft: technical ? 24 : 0,
      }}
    >
      <blockquote
        style={{
          margin: 0,
          fontFamily: PAGE.display,
          fontWeight: technical ? 500 : 600,
          color: PAGE.ink,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          fontSize: technical ? 20 : 'clamp(24px, 3.4vw, 38px)',
        }}
      >
        {technical ? quote.text : `“${quote.text}”`}
      </blockquote>
      {quote.attribution && (
        <figcaption
          style={{
            marginTop: 18,
            fontFamily: PAGE.body,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.06em',
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
