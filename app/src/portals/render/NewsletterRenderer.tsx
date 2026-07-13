import type { NodeContent } from '../types';
import { PAGE, eyebrowStyle, headingStyle } from './blocks/page-tokens';

interface NewsletterRendererProps {
  content: NodeContent;
}

/**
 * Email-digest rendering of the SAME NodeContent used for the web page — proof
 * that content/design separation extends across channels, not just themes.
 * Deliberately narrow, single-column, no nav/footer site chrome.
 */
export function NewsletterRenderer({ content }: NewsletterRendererProps) {
  const stats = (content.stats ?? []).slice(0, 3);
  const firstParagraph = content.body?.[0];

  return (
    <div style={{ background: PAGE.wash, minHeight: '100%', padding: '32px 16px', fontFamily: PAGE.body }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: PAGE.paper, border: `1px solid ${PAGE.line}` }}>
        {/* Masthead */}
        <div style={{ padding: '20px 28px', borderBottom: `2px solid ${PAGE.ink}`, textAlign: 'center' }}>
          <span style={{ fontFamily: PAGE.body, fontWeight: 700, fontSize: 20, letterSpacing: '-0.04em', color: PAGE.ink }}>adidas</span>
          <div style={{ marginTop: 6, fontFamily: PAGE.body, fontSize: 10.5, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: PAGE.mute }}>
            Group Newsroom Digest
          </div>
        </div>

        {content.heroImage && (
          <img src={content.heroImage} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
        )}

        <div style={{ padding: '28px 28px 8px' }}>
          {content.eyebrow && <div style={eyebrowStyle}>{content.eyebrow}</div>}
          {content.title && (
            <h1 style={{ ...headingStyle(2), fontSize: 24, lineHeight: 1.1, margin: '10px 0 0' }}>
              {content.title}
            </h1>
          )}
          {content.lead && (
            <p style={{ fontFamily: PAGE.body, fontSize: 15, lineHeight: 1.55, color: PAGE.mute, margin: '14px 0 0' }}>
              {content.lead}
            </p>
          )}
        </div>

        {stats.length > 0 && (
          <div style={{ display: 'flex', gap: 1, background: PAGE.line, margin: '20px 28px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ flex: 1, background: PAGE.paper, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: PAGE.display, fontSize: 22, fontWeight: 800, color: PAGE.ink, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontFamily: PAGE.body, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: PAGE.mute, marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {firstParagraph && (
          <p style={{ fontFamily: PAGE.body, fontSize: 14, lineHeight: 1.6, color: PAGE.ink, margin: '4px 28px 24px' }}>
            {firstParagraph}
          </p>
        )}

        <div style={{ padding: '0 28px 28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: PAGE.ink,
              color: PAGE.paper,
              fontFamily: PAGE.body,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '13px 22px',
            }}
          >
            Read on adidas-group.com
            <span style={{ fontSize: 15 }}>⟶</span>
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${PAGE.line}`, fontFamily: PAGE.body, fontSize: 11, color: PAGE.faint, lineHeight: 1.5 }}>
          You're receiving this because you subscribed to adidas Group Newsroom updates.
          <br />
          adidas AG · Adi-Dassler-Platz 1 · 91074 Herzogenaurach, Germany · Unsubscribe
        </div>
      </div>
    </div>
  );
}
