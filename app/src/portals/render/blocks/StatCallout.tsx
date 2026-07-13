import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function StatCallout({ content, theme }: BlockProps) {
  const stats = content.stats ?? [];
  if (stats.length === 0) return null;

  const technical = theme === 'technical';

  if (technical) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
          border: `1px solid ${PAGE.line}`,
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '20px 22px',
              borderLeft: i % 4 === 0 ? 'none' : `1px solid ${PAGE.line}`,
              borderTop: i >= 4 ? `1px solid ${PAGE.line}` : 'none',
            }}
          >
            <div
              style={{
                fontFamily: PAGE.display,
                fontWeight: 800,
                fontSize: 32,
                letterSpacing: '-0.02em',
                color: PAGE.ink,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: PAGE.body,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: PAGE.mute,
                marginTop: 8,
                lineHeight: 1.3,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, textAlign: 'center' }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 160px',
            padding: '4px 32px',
            borderLeft: i === 0 ? 'none' : `1px solid ${PAGE.line}`,
          }}
        >
          <div
            style={{
              fontFamily: PAGE.display,
              fontWeight: 800,
              fontSize: 'clamp(40px, 5vw, 64px)',
              letterSpacing: '-0.02em',
              color: PAGE.ink,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: PAGE.body,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: PAGE.mute,
              marginTop: 10,
              lineHeight: 1.3,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
