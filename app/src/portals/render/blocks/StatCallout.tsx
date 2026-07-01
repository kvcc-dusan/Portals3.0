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
                fontSize: 30,
                letterSpacing: '-0.02em',
                color: PAGE.ink,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontFamily: PAGE.body, fontSize: 12, color: PAGE.mute, marginTop: 8, lineHeight: 1.3 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 180px',
            padding: '0 28px',
            borderLeft: i === 0 ? 'none' : `1px solid ${PAGE.line}`,
          }}
        >
          <div
            style={{
              fontFamily: PAGE.display,
              fontWeight: 800,
              fontSize: 'clamp(36px, 4.5vw, 52px)',
              letterSpacing: '-0.03em',
              color: PAGE.ink,
              lineHeight: 1,
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontFamily: PAGE.body, fontSize: 14, color: PAGE.mute, marginTop: 12, lineHeight: 1.35 }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
