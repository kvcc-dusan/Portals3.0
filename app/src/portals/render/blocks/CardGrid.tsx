import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function CardGrid({ content, theme }: BlockProps) {
  const cards = content.cards ?? [];
  if (cards.length === 0) return null;

  const dense = theme === 'technical';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${dense ? 240 : 280}px, 1fr))`,
        gap: dense ? 12 : 20,
      }}
    >
      {cards.map((card, i) => (
        <article
          key={i}
          style={{
            border: `1px solid ${PAGE.line}`,
            padding: dense ? 20 : 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: dense ? 120 : 160,
            background: PAGE.paper,
          }}
        >
          {card.meta && (
            <span
              style={{
                fontFamily: PAGE.body,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: PAGE.faint,
              }}
            >
              {card.meta}
            </span>
          )}
          <h3
            style={{
              margin: 0,
              fontFamily: PAGE.display,
              fontWeight: 700,
              fontSize: dense ? 17 : 20,
              lineHeight: 1.15,
              color: PAGE.ink,
              letterSpacing: '-0.01em',
            }}
          >
            {card.title}
          </h3>
          {card.blurb && (
            <p
              style={{
                margin: 0,
                marginTop: 'auto',
                fontFamily: PAGE.body,
                fontSize: 14,
                lineHeight: 1.5,
                color: PAGE.mute,
              }}
            >
              {card.blurb}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
