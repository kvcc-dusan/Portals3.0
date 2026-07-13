import { PAGE, headingStyle } from './page-tokens';
import type { BlockProps } from './types';

export function LinkList({ content, theme }: BlockProps) {
  const links = content.links ?? [];
  if (links.length === 0) return null;

  const dense = theme === 'technical';

  if (dense) {
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
              padding: '12px 0',
              borderBottom: `1px solid ${PAGE.line}`,
            }}
          >
            <span style={{ fontFamily: PAGE.display, fontWeight: 600, fontSize: 15, color: PAGE.ink, letterSpacing: '-0.01em' }}>
              {link.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexShrink: 0 }}>
              {link.meta && (
                <span style={{ fontFamily: PAGE.body, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: PAGE.faint }}>
                  {link.meta}
                </span>
              )}
              <span style={{ fontFamily: PAGE.body, fontSize: 16, color: PAGE.ink, lineHeight: 1 }}>→</span>
            </span>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <div>
      <h3 style={{ ...headingStyle(3), fontSize: 20, marginBottom: 20, borderTop: `2px solid ${PAGE.ink}`, paddingTop: 20 }}>Popular</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', columnGap: 40, rowGap: 4 }}>
        {links.map((link, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: `1px solid ${PAGE.line}` }}>
            <span
              style={{
                fontFamily: PAGE.body,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: PAGE.ink,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {link.label}
            </span>
            {link.meta && (
              <span style={{ fontFamily: PAGE.body, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: PAGE.faint, flexShrink: 0 }}>
                {link.meta}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
