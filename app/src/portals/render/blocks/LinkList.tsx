import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function LinkList({ content, theme }: BlockProps) {
  const links = content.links ?? [];
  if (links.length === 0) return null;

  const dense = theme === 'technical';

  return (
    <nav style={{ borderTop: `1px solid ${PAGE.ink}` }}>
      {links.map((link, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 16,
            padding: dense ? '12px 0' : '18px 0',
            borderBottom: `1px solid ${PAGE.line}`,
          }}
        >
          <span
            style={{
              fontFamily: PAGE.display,
              fontWeight: 600,
              fontSize: dense ? 16 : 19,
              color: PAGE.ink,
              letterSpacing: '-0.01em',
            }}
          >
            {link.label}
          </span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexShrink: 0 }}>
            {link.meta && (
              <span
                style={{
                  fontFamily: PAGE.body,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: PAGE.faint,
                }}
              >
                {link.meta}
              </span>
            )}
            <span style={{ fontFamily: PAGE.body, fontSize: 18, color: PAGE.ink, lineHeight: 1 }}>→</span>
          </span>
        </div>
      ))}
    </nav>
  );
}
