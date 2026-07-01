import { useMemo, useState } from 'react';
import type { PortalNode } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { Canvas } from '../workspace/Canvas';
import { computeHealth, attentionList, issueReason, HEALTH_META, HEALTHY_COLOR, type HealthIssue } from '../data/health';

interface MaintenanceProps {
  nodes: Record<string, PortalNode>;
  selectedId: string | null;
  collapsed: string[];
  focusId: string | null;
  onSelect: (id: string | null) => void;
  onToggleCollapse: (id: string) => void;
  onFocusNode: (id: string) => void;
  onSync: (id: string) => void;
  onReview: (id: string) => void;
  onRefresh: (id: string) => void;
  onGenerate: (id: string) => void;
}

const ISSUE_ORDER: HealthIssue[] = ['drift', 'review', 'stale', 'draft'];

export function Maintenance(props: MaintenanceProps) {
  const { nodes, selectedId, collapsed, focusId, onSelect, onToggleCollapse, onFocusNode } = props;
  const [filter, setFilter] = useState<HealthIssue | 'all'>('all');

  const health = useMemo(() => computeHealth(nodes), [nodes]);
  const items = useMemo(() => attentionList(nodes), [nodes]);

  const counts = useMemo(() => {
    const c: Record<HealthIssue, number> = { drift: 0, review: 0, stale: 0, draft: 0 };
    items.forEach((x) => x.health.issues.forEach((i) => (c[i] += 1)));
    return c;
  }, [items]);

  const total = Object.keys(nodes).length;
  const score = total ? Math.round(((total - items.length) / total) * 100) : 100;
  const shown = filter === 'all' ? items : items.filter((x) => x.health.issues.includes(filter));

  const runAction = (node: PortalNode, top: HealthIssue) => {
    if (top === 'drift') props.onSync(node.id);
    else if (top === 'review') props.onReview(node.id);
    else if (top === 'stale') props.onRefresh(node.id);
    else props.onGenerate(node.id);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* KPI strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '13px 24px', borderBottom: `1px solid ${TOOL.border}`, background: TOOL.panel }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
          <span style={ui({ color: TOOL.primary, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 })}>{score}%</span>
          <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.14em' })}>SITE HEALTH</span>
        </div>
        <div style={{ width: 1, height: 26, background: TOOL.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Chip label="All" count={items.length} color={TOOL.mute} active={filter === 'all'} onClick={() => setFilter('all')} />
          {ISSUE_ORDER.map((i) => (
            <Chip key={i} label={HEALTH_META[i].short} count={counts[i]} color={HEALTH_META[i].color} active={filter === i} onClick={() => setFilter(filter === i ? 'all' : i)} />
          ))}
        </div>
      </div>

      {/* Split: attention list + health graph */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{ width: 400, flexShrink: 0, borderRight: `1px solid ${TOOL.border}`, background: TOOL.panel, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={ui({ color: TOOL.content, fontSize: 13, fontWeight: 600 })}>Needs attention</span>
            <span style={mono({ color: TOOL.faint, fontSize: 11 })}>{shown.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 10px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {shown.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: HEALTHY_COLOR, margin: '0 auto 12px' }} />
                <p style={ui({ color: TOOL.mute, fontSize: 13, lineHeight: 1.5 })}>All clear — nothing needs attention.</p>
              </div>
            ) : (
              shown.map(({ node, health: h }) => (
                <AttentionRow
                  key={node.id}
                  node={node}
                  parentName={node.parentId ? nodes[node.parentId]?.name : undefined}
                  issues={h.issues}
                  selected={node.id === selectedId}
                  onOpen={() => onFocusNode(node.id)}
                  onAction={() => runAction(node, h.top!)}
                />
              ))
            )}
          </div>
        </div>

        {/* Health-lensed graph */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <Canvas
            nodes={nodes}
            selectedId={selectedId}
            selectedEdgeId={null}
            collapsed={collapsed}
            justRefreshedId={null}
            focusId={focusId}
            onSelect={onSelect}
            onSelectEdge={() => {}}
            onDeleteEdge={() => {}}
            onAddReference={() => {}}
            onToggleCollapse={onToggleCollapse}
            readOnly
            healthById={health}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ label, count, color, active, onClick }: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={ui({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 11px',
        borderRadius: 100,
        border: `1px solid ${active ? color : TOOL.border}`,
        background: active ? `${color}1a` : 'transparent',
        cursor: 'pointer',
      })}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={ui({ color: active ? TOOL.primary : TOOL.content, fontSize: 12 })}>{label}</span>
      <span style={mono({ color: TOOL.faint, fontSize: 10 })}>{count}</span>
    </button>
  );
}

function AttentionRow({
  node, parentName, issues, selected, onOpen, onAction,
}: {
  node: PortalNode;
  parentName?: string;
  issues: HealthIssue[];
  selected: boolean;
  onOpen: () => void;
  onAction: () => void;
}) {
  const top = issues[0];
  const meta = HEALTH_META[top];
  const reason = issueReason(node, top);
  const secondary = issues.length > 1 ? issues.slice(1).map((i) => HEALTH_META[i].short.toLowerCase()).join(', ') : '';
  return (
    <div
      className="pf-attn-row"
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: '11px 10px 11px 12px',
        borderRadius: 9,
        border: `1px solid ${selected ? TOOL.accent : 'transparent'}`,
        background: selected ? 'rgba(83,20,255,0.07)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, minWidth: 0 }}>
          <span style={ui({ color: TOOL.primary, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>{node.name}</span>
          {parentName && <span style={mono({ color: TOOL.faint, fontSize: 9, flexShrink: 0 })}>{parentName}</span>}
        </div>
        <span style={ui({ color: TOOL.content, fontSize: 11.5, lineHeight: 1.4 })}>
          {reason}
          {secondary && <span style={{ color: TOOL.faint }}> · also {secondary}</span>}
        </span>
      </div>
      <button
        className="pf-attn-action"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        style={ui({
          flexShrink: 0,
          padding: '6px 14px',
          borderRadius: 100,
          border: `1px solid ${TOOL.border}`,
          background: 'transparent',
          color: TOOL.content,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          marginTop: 1,
        })}
      >
        {meta.action}
      </button>
    </div>
  );
}
