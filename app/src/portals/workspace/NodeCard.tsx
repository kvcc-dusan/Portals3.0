import type { NodeType, PortalNode, Provenance } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { PROVENANCE_META } from '../chrome/Provenance';
import { HEALTH_META, type NodeHealth } from '../data/health';
import { NODE_SIZE } from './canvas-geometry';

interface NodeCardProps {
  node: PortalNode;
  selected: boolean;
  justRefreshed: boolean;
  dimmed: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  childCount: number;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onStartLink: (id: string, e: React.MouseEvent) => void;
  onCompleteLink: (id: string) => void;
  onHover: (id: string) => void;
  onHoverEnd: () => void;
  readOnly?: boolean;
  health?: NodeHealth;
}

type Glyph = 'diamond' | 'square' | 'ring' | 'bar';

interface TypeStyle {
  bg: string;
  border: string;
  radius: number;
  nameColor: string;
  nameSize: number;
  nameWeight: number;
  glyph: Glyph;
  glyphColor: string;
}

// Each node type gets a distinct fill weight, border, corner radius, name
// treatment and glyph — so a glance tells site / page / section / block apart.
const TYPE_STYLE: Record<NodeType, TypeStyle> = {
  site: { bg: '#17121f', border: '#33294d', radius: 14, nameColor: TOOL.primary, nameSize: 15, nameWeight: 600, glyph: 'diamond', glyphColor: TOOL.accent },
  page: { bg: '#0c0c0c', border: '#2c2c2c', radius: 11, nameColor: TOOL.primary, nameSize: 13.5, nameWeight: 600, glyph: 'square', glyphColor: '#cfcfcf' },
  section: { bg: '#070707', border: '#1c1c1c', radius: 9, nameColor: TOOL.content, nameSize: 12.5, nameWeight: 500, glyph: 'ring', glyphColor: '#8a8a8a' },
  block: { bg: '#0a0a0a', border: '#151515', radius: 7, nameColor: TOOL.mute, nameSize: 11.5, nameWeight: 500, glyph: 'bar', glyphColor: '#5a5a5a' },
};

function TypeGlyph({ glyph, color }: { glyph: Glyph; color: string }) {
  switch (glyph) {
    case 'diamond':
      return <svg width="11" height="11" viewBox="0 0 12 12"><rect x="2.5" y="2.5" width="7" height="7" transform="rotate(45 6 6)" fill={color} /></svg>;
    case 'square':
      return <svg width="11" height="11" viewBox="0 0 12 12"><rect x="2.5" y="2.5" width="7" height="7" rx="1.5" fill={color} /></svg>;
    case 'ring':
      return <svg width="11" height="11" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.2" fill="none" stroke={color} strokeWidth="1.6" /></svg>;
    case 'bar':
      return <svg width="11" height="11" viewBox="0 0 12 12"><rect x="2" y="4" width="8" height="1.5" rx="0.75" fill={color} /><rect x="2" y="6.8" width="5" height="1.5" rx="0.75" fill={color} /></svg>;
  }
}

export function NodeCard({
  node, selected, justRefreshed, dimmed, hasChildren, collapsed, childCount,
  onSelect, onToggleCollapse, onStartLink, onCompleteLink, onHover, onHoverEnd, readOnly, health,
}: NodeCardProps) {
  const { w, h } = NODE_SIZE[node.type];
  const ts = TYPE_STYLE[node.type];
  const proposed = node.proposed;
  const isBlock = node.type === 'block';
  const hasBindings = (node.bindings?.length ?? 0) > 0;
  const issue = health && health.top ? HEALTH_META[health.top] : null;
  const healthDim = !!health && !issue; // healthy node under the maintenance lens
  const borderColor = selected ? TOOL.accent : issue ? issue.color : proposed ? '#3a2d6b' : ts.border;

  return (
    <div
      className="pf-node"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={() => onCompleteLink(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onHoverEnd}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: w,
        height: h,
        textAlign: 'left',
        background: ts.bg,
        border: `1px ${proposed ? 'dashed' : 'solid'} ${borderColor}`,
        borderRadius: ts.radius,
        opacity: dimmed ? 0.22 : healthDim ? 0.42 : 1,
        boxShadow: selected
          ? '0 0 0 3px rgba(83,20,255,0.22)'
          : issue
            ? `0 0 0 1px ${issue.color}, 0 0 18px ${issue.color}55`
            : proposed
              ? '0 0 24px rgba(83,20,255,0.22)'
              : '0 1px 2px rgba(0,0,0,0.4)',
        padding: isBlock ? '0 12px' : '0 13px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 3,
        transition: 'left 0.3s ease, top 0.3s ease, opacity 0.2s ease, border-color 0.15s, box-shadow 0.15s',
        animation: justRefreshed
          ? 'refreshPulse 1.2s ease'
          : proposed
            ? 'nodeIn 0.5s ease both'
            : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {hasChildren && (
          <button
            type="button"
            className={`pf-node-caret${collapsed ? ' is-collapsed' : ''}`}
            title={collapsed ? `Expand (${childCount})` : 'Collapse'}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(node.id);
            }}
            style={{
              background: collapsed ? TOOL.accent : 'transparent',
              border: `1px solid ${collapsed ? TOOL.accent : TOOL.border}`,
              borderRadius: 5,
              color: collapsed ? '#fff' : TOOL.mute,
              width: 15,
              height: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: 9,
              lineHeight: 1,
            }}
          >
            {collapsed ? '+' : '–'}
          </button>
        )}
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>
          <TypeGlyph glyph={ts.glyph} color={ts.glyphColor} />
        </span>
        <span
          style={ui({
            color: ts.nameColor,
            fontSize: ts.nameSize,
            fontWeight: ts.nameWeight,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })}
        >
          {node.name}
        </span>
        {/* Blocks are single-line: trailing signals sit inline at the end */}
        {isBlock && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {hasBindings && <LiveDot />}
            {node.origin && <ProvenanceDot origin={node.origin} />}
            {collapsed && childCount > 0 && <span style={mono({ color: TOOL.faint, fontSize: 9 })}>+{childCount}</span>}
          </span>
        )}
      </div>

      {!isBlock && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 19 }}>
          <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.14em' })}>{node.type.toUpperCase()}</span>
          {hasBindings && <LiveDot />}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            {node.updatedAt && <span style={mono({ color: TOOL.faint, fontSize: 9 })}>{node.updatedAt}</span>}
            {node.origin && <ProvenanceDot origin={node.origin} />}
          </span>
        </div>
      )}

      {/* Link handle — drag to another node to create a reference edge */}
      {!readOnly && (
        <div
          className="pf-node-handle"
          title="Drag to link"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onStartLink(node.id, e);
          }}
          style={{
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: TOOL.bg,
            border: `1.5px solid ${TOOL.accent}`,
            cursor: 'crosshair',
          }}
        />
      )}
    </div>
  );
}

/** Content provenance — the human-in-the-loop trust signal. */
function ProvenanceDot({ origin, style }: { origin: Provenance; style?: React.CSSProperties }) {
  return (
    <span
      title={PROVENANCE_META[origin].label}
      style={{ width: 6, height: 6, borderRadius: '50%', background: PROVENANCE_META[origin].color, flexShrink: 0, ...style }}
    />
  );
}

/** Live corporate-data binding — this node pulls figures from a source. */
function LiveDot() {
  return (
    <span
      title="Live data · pulls from a corporate source"
      style={{ width: 6, height: 6, borderRadius: '50%', background: '#3ddc84', flexShrink: 0, animation: 'livePulse 2s infinite' }}
    />
  );
}
