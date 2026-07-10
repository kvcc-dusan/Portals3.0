import { useState } from 'react';
import type { ComponentKind, CorporateContext, NodeContent, ThemeId } from '../types';
import { composeTheme } from './themes';
import { BLOCKS } from './blocks';
import { PAGE, layoutFor } from './blocks/page-tokens';

interface EmbedRef {
  id: string;
  name: string;
  content: NodeContent;
}

interface PageRendererProps {
  content: NodeContent;
  theme: ThemeId;
  context: CorporateContext;
  /** Hide the site shell (brand bar + footer) for compact side-by-side compare. */
  bare?: boolean;
  /** Outline these block kinds — used by the Maintenance visual diff. */
  highlightKinds?: Set<ComponentKind>;
  /** Enable hover/click affordances per block — used by Preview's block editor. */
  editable?: boolean;
  selectedKind?: ComponentKind | null;
  onSelectBlock?: (kind: ComponentKind) => void;
  /** Transcluded block nodes this page references — rendered after the main sequence. */
  embeds?: EmbedRef[];
}

const NAV = ['Company', 'Sustainability', 'Investors', 'Newsroom', 'Brands'];

const KIND_LABEL: Record<ComponentKind, string> = {
  hero: 'Hero',
  'pull-quote': 'Quote',
  'text-block': 'Text',
  'image-grid': 'Images',
  'data-table': 'Table',
  'stat-callout': 'Stats',
  'card-grid': 'Cards',
  'link-list': 'Links',
};

/**
 * THE render step. Given (node content + theme) it produces a finished page.
 * Themes are swappable inputs — there is exactly one renderer; layout is driven
 * entirely by the theme grammar, never by per-theme page components.
 */
export function PageRenderer({ content, theme, context, bare = false, highlightKinds, editable, selectedKind, onSelectBlock, embeds }: PageRendererProps) {
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
          return (
            <BlockSlot
              key={kind}
              kind={kind}
              highlighted={!!highlightKinds?.has(kind)}
              editable={!!editable}
              selected={selectedKind === kind}
              onSelect={onSelectBlock}
            >
              <Block content={content} theme={theme} />
            </BlockSlot>
          );
        })}

        {embeds?.map((embed) => (
          <EmbeddedBlock key={embed.id} embed={embed} theme={theme} />
        ))}
      </main>

      {!bare && <SiteFooter />}
    </div>
  );
}

/**
 * Renders a transcluded block node — same content, composed with THIS page's
 * theme. The "living connections" proof: refresh the block once, it updates
 * on every page that references it.
 */
function EmbeddedBlock({ embed, theme }: { embed: EmbedRef; theme: ThemeId }) {
  const sequence = composeTheme(theme, embed.content);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8, borderTop: `1px dashed ${PAGE.line}` }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: PAGE.faint,
        }}
      >
        ⟲ Shared block · {embed.name}
      </span>
      {sequence.map((kind) => {
        const Block = BLOCKS[kind];
        return <Block key={kind} content={embed.content} theme={theme} />;
      })}
    </div>
  );
}

function BlockSlot({
  kind, children, highlighted, editable, selected, onSelect,
}: {
  kind: ComponentKind;
  children: React.ReactNode;
  highlighted: boolean;
  editable: boolean;
  selected: boolean;
  onSelect?: (kind: ComponentKind) => void;
}) {
  const [hover, setHover] = useState(false);
  const showOutline = highlighted || selected || (editable && hover);
  const showLabel = highlighted || selected || (editable && hover);

  return (
    <div
      onMouseEnter={editable ? () => setHover(true) : undefined}
      onMouseLeave={editable ? () => setHover(false) : undefined}
      onClick={editable ? () => onSelect?.(kind) : undefined}
      style={{
        position: 'relative',
        cursor: editable ? 'pointer' : undefined,
        outline: showOutline ? `2px solid ${selected ? '#5314ff' : highlighted ? '#5314ff' : 'rgba(83,20,255,0.5)'}` : 'none',
        outlineOffset: 6,
        borderRadius: 3,
        transition: 'outline-color 0.1s',
      }}
    >
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            top: -11,
            left: 6,
            background: '#5314ff',
            color: '#fff',
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: 4,
            fontFamily: PAGE.body,
            pointerEvents: 'none',
          }}
        >
          {KIND_LABEL[kind]}
        </span>
      )}
      {children}
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
