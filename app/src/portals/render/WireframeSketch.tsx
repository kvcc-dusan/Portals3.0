import type { ComponentKind, NodeContent, ThemeId } from '../types';
import { composeTheme, THEME_META } from './themes';

interface WireframeSketchProps {
  content: NodeContent;
  theme: ThemeId;
}

const LINE = '#d8d8d8';
const LINE_DARK = '#b7b7b7';
const BOX = '#e8e8e8';

/**
 * A cheap, grayscale layout sketch — derived from the SAME composeTheme sequence
 * the real renderer uses, so it honestly reflects structure/order without
 * pretending to be a finished design (no real content, no real images). Framed
 * with nav/footer chrome so it reads as a page, not a stray content block.
 */
export function WireframeSketch({ content, theme }: WireframeSketchProps) {
  const sequence = composeTheme(theme, content);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e2e2',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Nav chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid #ececec' }}>
          <div style={{ width: 16, height: 8, borderRadius: 2, background: '#1a1a1a', flexShrink: 0 }} />
          <div style={{ flex: 1 }} />
          {[16, 13, 10].map((w, i) => (
            <div key={i} style={{ width: w, height: 5, borderRadius: 2, background: '#d3d3d3' }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 190 }}>
          {sequence.length === 0 ? (
            <Bar w="60%" h={10} color={LINE} />
          ) : (
            sequence.map((kind) => <BlockSketch key={kind} kind={kind} />)
          )}
        </div>

        {/* Footer chrome */}
        <div style={{ display: 'flex', gap: 18, padding: '12px 14px', borderTop: '1px solid #ececec' }}>
          {[0, 1, 2].map((col) => (
            <div key={col} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Bar w="55%" h={5} color={LINE_DARK} />
              <Bar w="75%" h={4} />
              <Bar w="60%" h={4} />
            </div>
          ))}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 9.5,
          letterSpacing: '0.08em',
          color: '#8a8a8a',
          textTransform: 'uppercase',
        }}
      >
        Layout sketch · {THEME_META[theme].label}
      </span>
    </div>
  );
}

function BlockSketch({ kind }: { kind: ComponentKind }) {
  switch (kind) {
    case 'hero':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Box h={78} />
          <Bar w="32%" h={6} color={LINE_DARK} />
          <Bar w="80%" h={13} />
          <Bar w="62%" h={7} />
        </div>
      );
    case 'text-block':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Bar w="96%" h={6} />
          <Bar w="88%" h={6} />
          <Bar w="92%" h={6} />
          <Bar w="60%" h={6} />
        </div>
      );
    case 'pull-quote':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <span style={{ width: 3, background: LINE_DARK, borderRadius: 2 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Bar w="90%" h={9} />
            <Bar w="70%" h={9} />
            <Bar w="30%" h={6} color={LINE_DARK} />
          </div>
        </div>
      );
    case 'image-grid':
      return (
        <div style={{ display: 'flex', gap: 6 }}>
          <Box h={44} flex={1} cross />
          <Box h={44} flex={1} cross />
        </div>
      );
    case 'data-table':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Bar w="45%" h={6} color={LINE_DARK} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3].map((j) => (
                <Bar key={j} w="100%" h={7} />
              ))}
            </div>
          ))}
        </div>
      );
    case 'stat-callout':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Bar w="70%" h={12} color={LINE_DARK} />
              <Bar w="90%" h={5} />
            </div>
          ))}
        </div>
      );
    case 'card-grid':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Box h={28} />
              <Bar w="80%" h={6} color={LINE_DARK} />
              <Bar w="60%" h={5} />
            </div>
          ))}
        </div>
      );
    case 'link-list':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: LINE_DARK, flexShrink: 0 }} />
              <Bar w={`${70 - i * 12}%`} h={6} />
            </div>
          ))}
        </div>
      );
  }
}

function Bar({ w, h, color = LINE }: { w: string; h: number; color?: string }) {
  return <div style={{ width: w, height: h, background: color, borderRadius: 3 }} />;
}

function Box({ h, flex, cross }: { h: number; flex?: number; cross?: boolean }) {
  return (
    <div
      style={{
        height: h,
        flex,
        width: flex ? undefined : '100%',
        background: BOX,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {cross && (
        <svg
          viewBox="0 0 24 24"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, opacity: 0.35 }}
        >
          <path d="M4 4l16 16M20 4L4 20" stroke="#a8a8a8" strokeWidth="1.4" fill="none" />
        </svg>
      )}
    </div>
  );
}
