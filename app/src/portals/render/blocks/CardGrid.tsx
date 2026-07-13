import { PAGE, headingStyle } from './page-tokens';
import type { BlockProps } from './types';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function CardGrid({ content, theme }: BlockProps) {
  const cards = content.cards ?? [];
  if (cards.length === 0) return null;

  const dense = theme === 'technical';

  if (dense) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {cards.map((card, i) => (
          <article
            key={i}
            style={{
              border: `1px solid ${PAGE.line}`,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minHeight: 120,
              background: PAGE.paper,
            }}
          >
            {card.meta && (
              <span style={{ fontFamily: PAGE.body, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: PAGE.faint }}>
                {card.meta}
              </span>
            )}
            <h3 style={{ ...headingStyle(4), fontSize: 15 }}>{card.title}</h3>
            {card.blurb && (
              <p style={{ margin: 0, marginTop: 'auto', fontFamily: PAGE.body, fontSize: 13.5, lineHeight: 1.5, color: PAGE.mute }}>
                {card.blurb}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
      {cards.map((card, i) => (
        <article key={i} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: PAGE.wash }}>
            <img
              src={`https://picsum.photos/seed/${slug(card.title)}/640/480?grayscale`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
            {card.meta && (
              <span style={{ fontFamily: PAGE.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PAGE.faint }}>
                {card.meta}
              </span>
            )}
            <h3 style={headingStyle(4)}>{card.title}</h3>
            {card.blurb && (
              <p style={{ margin: 0, fontFamily: PAGE.body, fontSize: 14, lineHeight: 1.55, color: PAGE.mute }}>
                {card.blurb}
              </p>
            )}
            <span
              style={{
                marginTop: 6,
                fontFamily: PAGE.body,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: PAGE.ink,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Read more →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
