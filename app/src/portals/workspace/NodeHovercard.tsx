import type { NodeContent, PortalNode } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { ProvenanceBadge } from '../chrome/Provenance';
import { THEME_META } from '../render/themes';

/** Rich-on-hover preview so the resting card can stay minimal. */
export function NodeHovercard({ node }: { node: PortalNode }) {
  const composes = countComponents(node.content);
  const refs = node.refs?.length ?? 0;
  const bindings = node.bindings ?? [];

  return (
    <div
      style={{
        width: 268,
        background: '#0b0b0b',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 12,
        boxShadow: '0 18px 50px rgba(0,0,0,0.65)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={ui({ color: TOOL.primary, fontSize: 14, fontWeight: 600, lineHeight: 1.2 })}>{node.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.1em' })}>{node.type.toUpperCase()}</span>
            <span style={{ color: TOOL.border }}>·</span>
            <span style={mono({ color: TOOL.mute, fontSize: 9, letterSpacing: '0.04em' })}>{node.context}</span>
            <span style={{ color: TOOL.border }}>·</span>
            <span style={mono({ color: TOOL.mute, fontSize: 9 })}>{THEME_META[node.theme].label}</span>
          </div>
        </div>

        {node.origin && <ProvenanceBadge origin={node.origin} updatedAt={node.updatedAt} />}

        {node.content.lead && (
          <p
            style={ui({
              color: TOOL.content,
              fontSize: 12,
              lineHeight: 1.5,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            })}
          >
            {node.content.lead}
          </p>
        )}

        {/* Live bindings — the corporate-data pull, with current values */}
        {bindings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bindings.slice(0, 2).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3ddc84', flexShrink: 0, animation: 'livePulse 2s infinite' }} />
                <span style={ui({ color: TOOL.content, fontSize: 11 })}>{b.syncedValue}</span>
                <span style={mono({ color: TOOL.faint, fontSize: 9, marginLeft: 'auto' })}>{b.syncedAt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick facts */}
        <div style={{ display: 'flex', gap: 14, borderTop: `1px solid ${TOOL.border}`, paddingTop: 10 }}>
          <Fact label="Blocks" value={composes.length} />
          <Fact label="Links" value={refs} />
          <Fact label="Live" value={bindings.length} />
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={ui({ color: TOOL.primary, fontSize: 15, fontWeight: 600 })}>{value}</span>
      <span style={mono({ color: TOOL.faint, fontSize: 8.5, letterSpacing: '0.1em' })}>{label.toUpperCase()}</span>
    </div>
  );
}

function countComponents(c: NodeContent): string[] {
  const present: string[] = [];
  if (c.title || c.heroImage || c.lead) present.push('hero');
  if (c.body?.length) present.push('text');
  if (c.quote) present.push('quote');
  if (c.images?.length) present.push('images');
  if (c.table) present.push('table');
  if (c.stats?.length) present.push('stats');
  if (c.cards?.length) present.push('cards');
  if (c.links?.length) present.push('links');
  return present;
}
