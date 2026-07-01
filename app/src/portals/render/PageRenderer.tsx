import type { CorporateContext, NodeContent, ThemeId } from '../types';
import { composeTheme } from './themes';
import { BLOCKS } from './blocks';
import { PAGE, layoutFor } from './blocks/page-tokens';

interface PageRendererProps {
  content: NodeContent;
  theme: ThemeId;
  context: CorporateContext;
  /** Hide the site shell (brand bar + footer) for compact side-by-side compare. */
  bare?: boolean;
}

const NAV = ['Company', 'Sustainability', 'Investors', 'Newsroom', 'Brands'];

/**
 * THE render step. Given (node content + theme) it produces a finished page.
 * Themes are swappable inputs — there is exactly one renderer; layout is driven
 * entirely by the theme grammar, never by per-theme page components.
 */
export function PageRenderer({ content, theme, context, bare = false }: PageRendererProps) {
  const sequence = composeTheme(theme, content);
  const layout = layoutFor(theme);

  return (
    <div style={{ background: PAGE.paper, color: PAGE.ink, minHeight: '100%', fontFamily: PAGE.body }}>
      {!bare && <BrandBar context={context} />}

      <main
        style={{
          maxWidth: layout.maxWidth,
          margin: '0 auto',
          padding: `${bare ? 40 : 64}px ${layout.gutter}px ${bare ? 48 : 96}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: layout.sectionGap,
        }}
      >
        {sequence.map((kind) => {
          const Block = BLOCKS[kind];
          return <Block key={kind} content={content} theme={theme} />;
        })}
      </main>

      {!bare && <SiteFooter />}
    </div>
  );
}

function BrandBar({ context }: { context: CorporateContext }) {
  return (
    <header
      style={{
        background: PAGE.ink,
        color: PAGE.paper,
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 40,
      }}
    >
      <span
        style={{
          fontFamily: PAGE.body,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: '-0.04em',
        }}
      >
        adidas
      </span>
      <nav style={{ display: 'flex', gap: 28, flex: 1 }}>
        {NAV.map((item) => {
          const active = item === context || (item === 'Investors' && context === 'Investor Relations');
          return (
            <span
              key={item}
              style={{
                fontFamily: PAGE.body,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? PAGE.paper : 'rgba(255,255,255,0.6)',
                borderBottom: active ? `2px solid ${PAGE.paper}` : '2px solid transparent',
                paddingBottom: 2,
              }}
            >
              {item}
            </span>
          );
        })}
      </nav>
      <span style={{ fontFamily: PAGE.body, fontSize: 12, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)' }}>
        EN ▾
      </span>
    </header>
  );
}

function SiteFooter() {
  const cols = [
    { title: 'Company', links: ['Our Strategy', 'Leadership', 'History', 'Careers'] },
    { title: 'Sustainability', links: ['Climate', 'Materials', 'Supply Chain'] },
    { title: 'Investors', links: ['Quarterly Results', 'Financial Calendar', 'Share'] },
    { title: 'Newsroom', links: ['Press Releases', 'Media Library'] },
  ];
  return (
    <footer style={{ background: PAGE.ink, color: PAGE.paper, padding: '56px 32px 40px' }}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 32,
        }}
      >
        {cols.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontFamily: PAGE.body,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 14,
              }}
            >
              {col.title}
            </div>
            {col.links.map((l) => (
              <div
                key={l}
                style={{
                  fontFamily: PAGE.body,
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: 9,
                }}
              >
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1080,
          margin: '40px auto 0',
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: PAGE.body,
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span style={{ fontFamily: PAGE.body, fontWeight: 700, letterSpacing: '-0.04em', fontSize: 18 }}>adidas</span>
        <span>© 2025 adidas AG. All rights reserved.</span>
      </div>
    </footer>
  );
}
