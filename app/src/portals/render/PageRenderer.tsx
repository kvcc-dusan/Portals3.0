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
  // A hero WITH an image escapes the centered content column so its banner can
  // run full-bleed, matching the real site. A text-only hero stays in <main>
  // like any other block — nothing to bleed, and it avoids double-padding.
  const heroEscapes = sequence[0] === 'hero' && !!content.heroImage && theme !== 'technical';
  const bodySequence = heroEscapes ? sequence.slice(1) : sequence;

  const renderSlot = (kind: ComponentKind) => {
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
  };

  return (
    <div style={{ background: PAGE.paper, color: PAGE.ink, minHeight: '100%', fontFamily: PAGE.body }}>
      {!bare && <BrandBar context={context} />}

      {heroEscapes && renderSlot('hero')}

      <main
        style={{
          maxWidth: layout.maxWidth,
          margin: '0 auto',
          padding: `${bare ? 40 : heroEscapes ? 56 : 64}px ${layout.gutter}px ${bare ? 48 : 96}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: layout.sectionGap,
        }}
      >
        {bodySequence.map(renderSlot)}

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
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: PAGE.mute,
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

const SUB_NAV: Record<CorporateContext, string[]> = {
  Company: ['Our Strategy', 'Leadership', 'History'],
  Sustainability: ['Climate', 'Materials & Circularity', 'Supply Chain'],
  'Investor Relations': ['Quarterly Results', 'Financial Calendar', 'Annual Report'],
  Newsroom: ['Press Releases', 'Media Library'],
  Brands: ['Performance', 'Originals'],
};

function BrandBar({ context }: { context: CorporateContext }) {
  const subNav = SUB_NAV[context] ?? [];
  return (
    <header style={{ background: PAGE.paper }}>
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          padding: '0 32px',
          borderBottom: `1px solid ${PAGE.line}`,
        }}
      >
        <img src="/adidas-logo-white.svg" alt="adidas" style={{ height: 20, width: 'auto', filter: 'invert(1)', display: 'block', flexShrink: 0 }} />
        <nav style={{ display: 'flex', gap: 28, flex: 1 }}>
          {NAV.map((item) => {
            const active = item === context || (item === 'Investors' && context === 'Investor Relations');
            return (
              <span
                key={item}
                style={{
                  fontFamily: PAGE.body,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active ? PAGE.ink : PAGE.mute,
                  borderBottom: active ? `2px solid ${PAGE.ink}` : '2px solid transparent',
                  paddingBottom: 4,
                }}
              >
                {item}
              </span>
            );
          })}
        </nav>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: PAGE.body, fontSize: 12, letterSpacing: '0.06em', color: PAGE.mute }}>EN ▾</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PAGE.ink} strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
      </div>
      {subNav.length > 0 && (
        <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px', borderBottom: `1px solid ${PAGE.line}` }}>
          {subNav.map((s, i) => (
            <span
              key={s}
              style={{
                fontFamily: PAGE.body,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: i === 0 ? PAGE.ink : PAGE.mute,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

function SiteFooter() {
  const utilityLinks = ['FAQ', 'Sitemap', 'Contact', 'Imprint', 'Legal Notice', 'Privacy Notice'];
  return (
    <footer style={{ background: PAGE.paper, borderTop: `2px solid ${PAGE.ink}`, padding: '32px 32px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 20,
            borderBottom: `1px solid ${PAGE.line}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: PAGE.body, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: PAGE.ink }}>
              Follow us on
            </span>
            <span
              style={{
                width: 26,
                height: 26,
                background: PAGE.ink,
                color: PAGE.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: PAGE.body,
              }}
            >
              in
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: PAGE.body, fontSize: 12, color: PAGE.mute }}>More about adidas</span>
            <span style={{ fontFamily: PAGE.body, fontWeight: 700, fontSize: 16, letterSpacing: '-0.04em', color: PAGE.ink }}>adidas</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {utilityLinks.map((l) => (
              <span key={l} style={{ fontFamily: PAGE.body, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: PAGE.mute }}>
                {l}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: PAGE.body, fontSize: 11, color: PAGE.faint }}>© 2026 adidas AG. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
