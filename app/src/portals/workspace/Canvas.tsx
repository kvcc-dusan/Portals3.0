import { useEffect, useMemo, useRef, useState } from 'react';
import type { EdgeId, PortalNode } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { PROVENANCE_META } from '../chrome/Provenance';
import { NodeCard } from './NodeCard';
import { NodeHovercard } from './NodeHovercard';
import { NODE_SIZE, anchorRight, anchorLeft } from './canvas-geometry';
import { computeLayout } from './layout';
import type { NodeHealth } from '../data/health';

interface CanvasProps {
  nodes: Record<string, PortalNode>;
  selectedId: string | null;
  selectedEdgeId: EdgeId | null;
  collapsed: string[];
  justRefreshedId: string | null;
  focusId: string | null;
  onSelect: (id: string | null) => void;
  onSelectEdge: (id: EdgeId | null) => void;
  onDeleteEdge: (id: EdgeId) => void;
  onAddReference: (from: string, to: string) => void;
  onToggleCollapse: (id: string) => void;
  /** Maintenance surface: tint nodes by health, disable editing affordances. */
  readOnly?: boolean;
  healthById?: Map<string, NodeHealth>;
}

interface View { x: number; y: number; scale: number }
interface Edge { id: EdgeId; from: { x: number; y: number }; to: { x: number; y: number }; active: boolean; lane?: number }
interface Branch { id: EdgeId; x: number; y: number; active: boolean }
interface Bus { trunkX: number; trunkY: number; busX: number; topY: number; botY: number; branches: Branch[] }

const MIN_SCALE = 0.3;
const MAX_SCALE = 2;
const INITIAL_VIEW: View = { x: 0, y: 0, scale: 0.8 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Canvas(props: CanvasProps) {
  const { nodes, selectedId, selectedEdgeId, collapsed, justRefreshedId, focusId } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [linking, setLinking] = useState<{ fromId: string; gx: number; gy: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const lastFocus = useRef<string | null>(null);

  // ── Auto-layout: positions derived from structure, not authored x/y ──
  const pos = useMemo(() => computeLayout(nodes, collapsed), [nodes, collapsed]);
  const posRef = useRef(pos);
  posRef.current = pos;
  const placed = (id: string) => {
    const p = pos.get(id) ?? { x: 0, y: 0 };
    return { x: p.x, y: p.y, type: nodes[id].type };
  };

  // ── Visibility (collapsed branches) ─────────────────────────────
  const isHidden = (n: PortalNode): boolean => {
    const seen = new Set<string>();
    let p = n.parentId;
    while (p && !seen.has(p)) {
      seen.add(p);
      if (collapsed.includes(p)) return true;
      p = nodes[p]?.parentId ?? null;
    }
    return false;
  };
  const visible = Object.values(nodes).filter((n) => !isHidden(n));
  const visibleIds = new Set(visible.map((n) => n.id));
  const directChildren = (id: string) => Object.values(nodes).filter((n) => n.parentId === id).length;

  // ── Hover focus: neighbourhood of the hovered node ──────────────
  const neighborhood = useMemo(() => {
    if (!hoveredId) return null;
    const set = new Set<string>([hoveredId]);
    const h = nodes[hoveredId];
    if (h?.parentId) set.add(h.parentId);
    h?.refs.forEach((r) => set.add(r));
    Object.values(nodes).forEach((n) => {
      if (n.parentId === hoveredId) set.add(n.id);
      if (n.refs.includes(hoveredId)) set.add(n.id);
    });
    return set;
  }, [hoveredId, nodes]);

  const hoverEdges = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set<EdgeId>();
    const h = nodes[hoveredId];
    if (h?.parentId) ids.add(`struct:${hoveredId}` as EdgeId);
    h?.refs.forEach((r) => ids.add(`ref:${hoveredId}:${r}` as EdgeId));
    Object.values(nodes).forEach((n) => {
      if (n.parentId === hoveredId) ids.add(`struct:${n.id}` as EdgeId);
      if (n.refs.includes(hoveredId)) ids.add(`ref:${n.id}:${hoveredId}` as EdgeId);
    });
    return ids;
  }, [hoveredId, nodes]);

  const onHover = (id: string) => {
    setHoveredId(id);
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setCardId(id), 220);
  };
  const onHoverEnd = () => {
    setHoveredId(null);
    window.clearTimeout(hoverTimer.current);
    setCardId(null);
  };
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // ── Coordinate helpers ──────────────────────────────────────────
  const toGraph = (clientX: number, clientY: number) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left - view.x) / view.scale, y: (clientY - r.top - view.y) / view.scale };
  };

  const zoomAt = (factor: number, cx: number, cy: number) =>
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / v.scale;
      return { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });

  const zoomButton = (factor: number) => {
    const r = containerRef.current!.getBoundingClientRect();
    zoomAt(factor, r.width / 2, r.height / 2);
  };

  const fitToView = () => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r || visible.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visible.forEach((n) => {
      const p = posRef.current.get(n.id) ?? { x: 0, y: 0 };
      const { w, h } = NODE_SIZE[n.type];
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + w); maxY = Math.max(maxY, p.y + h);
    });
    const pad = 90;
    const bw = maxX - minX + pad * 2;
    const bh = maxY - minY + pad * 2;
    const scale = clamp(Math.min(r.width / bw, r.height / bh), MIN_SCALE, MAX_SCALE);
    setView({
      scale,
      x: (r.width - bw * scale) / 2 - (minX - pad) * scale,
      y: (r.height - bh * scale) / 2 - (minY - pad) * scale,
    });
  };

  // Native wheel listener so we can preventDefault (passive listeners can't).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAt(factor, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Centre on the selected node once, on mount.
  useEffect(() => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const id = selectedId && nodes[selectedId] ? selectedId : Object.values(nodes).find((n) => !n.parentId)?.id;
    const p = id ? posRef.current.get(id) : null;
    if (!id || !p) return;
    const { w, h } = NODE_SIZE[nodes[id].type];
    const scale = 0.8;
    setView({ scale, x: r.width / 2 - (p.x + w / 2) * scale, y: r.height / 2 - (p.y + h / 2) * scale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-shot recenter when a focus is requested (e.g. after ingest place).
  useEffect(() => {
    if (!focusId || focusId === lastFocus.current) return;
    lastFocus.current = focusId;
    const p = posRef.current.get(focusId);
    const r = containerRef.current?.getBoundingClientRect();
    if (!p || !r || !nodes[focusId]) return;
    const { w, h } = NODE_SIZE[nodes[focusId].type];
    setView((v) => ({ scale: v.scale, x: r.width / 2 - (p.x + w / 2) * v.scale, y: r.height / 2 - (p.y + h / 2) * v.scale }));
  }, [focusId, nodes]);

  // ── Pointer handlers ────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    pan.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    moved.current = false;
    setDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (linking) {
      const g = toGraph(e.clientX, e.clientY);
      setLinking((l) => (l ? { ...l, gx: g.x, gy: g.y } : l));
      return;
    }
    const start = pan.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    setView((v) => ({ ...v, x: start.vx + dx, y: start.vy + dy }));
  };
  const endDrag = () => {
    pan.current = null;
    setDragging(false);
    if (linking) setLinking(null);
  };

  const onBackgroundClick = () => {
    if (moved.current || linking) return;
    props.onSelect(null);
    props.onSelectEdge(null);
  };

  const startLink = (fromId: string, e: React.MouseEvent) => {
    const g = toGraph(e.clientX, e.clientY);
    setLinking({ fromId, gx: g.x, gy: g.y });
  };
  const completeLink = (targetId: string) => {
    if (!linking) return;
    if (linking.fromId !== targetId) props.onAddReference(linking.fromId, targetId);
    setLinking(null);
  };

  // ── Edges (only between visible nodes) ──────────────────────────
  const childrenByParent = new Map<string, PortalNode[]>();
  visible.forEach((n) => {
    if (n.parentId && visibleIds.has(n.parentId)) {
      const arr = childrenByParent.get(n.parentId) ?? [];
      arr.push(n);
      childrenByParent.set(n.parentId, arr);
    }
  });

  const buses: Bus[] = [...childrenByParent.entries()].map(([parentId, kids]) => {
    const pr = anchorRight(placed(parentId));
    const lefts = kids.map((k) => anchorLeft(placed(k.id)));
    const busX = (pr.x + Math.min(...lefts.map((l) => l.x))) / 2;
    const branches = kids
      .map((k) => {
        const a = anchorLeft(placed(k.id));
        return { id: `struct:${k.id}` as EdgeId, x: a.x, y: a.y, active: selectedEdgeId === `struct:${k.id}` };
      })
      .sort((a, b) => a.y - b.y);
    const ys = branches.map((b) => b.y);
    return { trunkX: pr.x, trunkY: pr.y, busX, topY: Math.min(pr.y, ...ys), botY: Math.max(pr.y, ...ys), branches };
  });

  const structural: Edge[] = buses.flatMap((bus) =>
    bus.branches.map((b) => ({ id: b.id, from: { x: bus.busX, y: b.y }, to: { x: b.x, y: b.y }, active: b.active })),
  );

  // Reference edges route through the left gutter, each in its own parallel lane
  // so multiple references stay aligned instead of stacking on one another.
  let refLane = 0;
  const referential: Edge[] = visible.flatMap((n) =>
    n.refs.filter((r) => visibleIds.has(r)).map((r) => ({
      id: `ref:${n.id}:${r}` as EdgeId,
      from: anchorLeft(placed(n.id)),
      to: anchorLeft(placed(r)),
      active: selectedEdgeId === `ref:${n.id}:${r}`,
      lane: refLane++,
    })),
  );

  const selectedEdge = [...structural, ...referential].find((e) => e.id === selectedEdgeId) ?? null;
  const linkSource = linking ? anchorRight(placed(linking.fromId)) : null;

  // Hovercard placed in screen space, to the right of the node.
  let hovercard: React.ReactNode = null;
  if (cardId && nodes[cardId]) {
    const p = pos.get(cardId);
    if (p) {
      const { w } = NODE_SIZE[nodes[cardId].type];
      hovercard = (
        <div style={{ position: 'absolute', left: view.x + (p.x + w + 14) * view.scale, top: view.y + p.y * view.scale, zIndex: 25, pointerEvents: 'none' }}>
          <NodeHovercard node={nodes[cardId]} />
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onClick={onBackgroundClick}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: TOOL.bg,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: `${28 * view.scale}px ${28 * view.scale}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        cursor: linking ? 'crosshair' : dragging ? 'grabbing' : 'grab',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}>
        <Edges buses={buses} structural={structural} referential={referential} onSelectEdge={props.onSelectEdge} linkSource={linkSource} linking={linking} hoverEdges={hoverEdges} readOnly={props.readOnly} />

        {visible.map((node) => {
          const p = pos.get(node.id) ?? { x: 0, y: 0 };
          return (
            <NodeCard
              key={node.id}
              node={{ ...node, x: p.x, y: p.y }}
              selected={node.id === selectedId}
              justRefreshed={node.id === justRefreshedId}
              dimmed={!!neighborhood && !neighborhood.has(node.id)}
              hasChildren={directChildren(node.id) > 0}
              collapsed={collapsed.includes(node.id)}
              childCount={directChildren(node.id)}
              onSelect={props.onSelect}
              onToggleCollapse={props.onToggleCollapse}
              onStartLink={startLink}
              onCompleteLink={completeLink}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
              readOnly={props.readOnly}
              health={props.healthById?.get(node.id)}
            />
          );
        })}

        {/* Delete control for the selected edge */}
        {!props.readOnly && selectedEdge && (
          <button
            type="button"
            title="Delete edge"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              props.onDeleteEdge(selectedEdge.id);
            }}
            style={{
              position: 'absolute',
              left: (selectedEdge.from.x + selectedEdge.to.x) / 2,
              top: (selectedEdge.from.y + selectedEdge.to.y) / 2,
              transform: `translate(-50%,-50%) scale(${1 / view.scale})`,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: TOOL.error,
              border: '2px solid #0f0f0f',
              color: '#fff',
              fontSize: 13,
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        )}
      </div>

      {hovercard}

      <ZoomControls scale={view.scale} onIn={() => zoomButton(1.2)} onOut={() => zoomButton(1 / 1.2)} onFit={fitToView} />
      {!props.readOnly && <Legend />}
    </div>
  );
}

const EDGE_R = 22;

function elbow(from: { x: number; y: number }, to: { x: number; y: number }, midX: number, R = EDGE_R): string {
  if (Math.abs(from.y - to.y) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const dy = from.y < to.y ? 1 : -1;
  const dx1 = midX >= from.x ? 1 : -1;
  const dx2 = to.x >= midX ? 1 : -1;
  const r = Math.max(0, Math.min(R, Math.abs(midX - from.x), Math.abs(to.x - midX), Math.abs(to.y - from.y) / 2));
  return `M ${from.x} ${from.y} L ${midX - dx1 * r} ${from.y} Q ${midX} ${from.y} ${midX} ${from.y + dy * r} L ${midX} ${to.y - dy * r} Q ${midX} ${to.y} ${midX + dx2 * r} ${to.y} L ${to.x} ${to.y}`;
}

function busPath(bus: Bus): string {
  const { trunkX, trunkY, busX, branches } = bus;
  if (branches.length === 1) return elbow({ x: trunkX, y: trunkY }, { x: branches[0].x, y: branches[0].y }, busX);
  const top = branches[0].y;
  const bot = branches[branches.length - 1].y;
  const r = Math.min(EDGE_R, (bot - top) / 2);
  const parts = [`M ${trunkX} ${trunkY} L ${busX} ${trunkY}`];
  if (trunkY < top) parts.push(`M ${busX} ${trunkY} L ${busX} ${top}`);
  if (trunkY > bot) parts.push(`M ${busX} ${bot} L ${busX} ${trunkY}`);
  parts.push(
    `M ${branches[0].x} ${top} L ${busX + r} ${top} Q ${busX} ${top} ${busX} ${top + r} L ${busX} ${bot - r} Q ${busX} ${bot} ${busX + r} ${bot} L ${branches[branches.length - 1].x} ${bot}`,
  );
  branches.slice(1, -1).forEach((b) => parts.push(`M ${busX} ${b.y} L ${b.x} ${b.y}`));
  return parts.join(' ');
}

function Edges({
  buses, structural, referential, onSelectEdge, linkSource, linking, hoverEdges, readOnly,
}: {
  buses: Bus[];
  structural: Edge[];
  referential: Edge[];
  onSelectEdge: (id: EdgeId | null) => void;
  linkSource: { x: number; y: number } | null;
  linking: { gx: number; gy: number } | null;
  hoverEdges: Set<EdgeId> | null;
  readOnly?: boolean;
}) {
  // Orthogonal route through a per-edge lane in the left gutter.
  const refPath = (e: Edge) => elbow(e.from, e.to, Math.min(e.from.x, e.to.x) - (40 + (e.lane ?? 0) * 16), 18);
  const select = (e: React.MouseEvent, id: EdgeId) => {
    e.stopPropagation();
    onSelectEdge(id);
  };
  const dim = hoverEdges != null;

  return (
    <svg style={{ position: 'absolute', left: -2000, top: -2000, width: 6000, height: 6000, pointerEvents: 'none', overflow: 'visible' }}>
      <g transform="translate(2000,2000)">
        {/* Base edges (dim while a node is hovered) */}
        <g opacity={dim ? 0.25 : 1} style={{ transition: 'opacity 0.15s ease' }}>
          {referential.map((e) => (
            <path key={e.id} d={refPath(e)} fill="none" stroke={e.active ? TOOL.accent : 'rgba(83,20,255,0.4)'} strokeWidth={e.active ? 2.4 : 1.3} strokeDasharray="3 4" />
          ))}
          {buses.map((bus, i) => (
            <path key={`bus-${i}`} d={busPath(bus)} fill="none" stroke="#2c2c2c" strokeWidth={1.5} />
          ))}
          {structural.filter((e) => e.active).map((e) => (
            <line key={`a-${e.id}`} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={TOOL.accent} strokeWidth={2.4} />
          ))}
        </g>

        {/* Hover highlight — edges touching the hovered node */}
        {dim && referential.filter((e) => hoverEdges!.has(e.id)).map((e) => (
          <path key={`hr-${e.id}`} d={refPath(e)} fill="none" stroke={TOOL.accent} strokeWidth={2} strokeDasharray="3 4" />
        ))}
        {dim && structural.filter((e) => hoverEdges!.has(e.id)).map((e) => (
          <line key={`hs-${e.id}`} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke="#6b5bd6" strokeWidth={2.2} />
        ))}

        {/* Hit layers — interactive only when editable */}
        {!readOnly && referential.map((e) => (
          <path key={`hit-${e.id}`} d={refPath(e)} fill="none" stroke="transparent" strokeWidth={16} style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onClick={(ev) => select(ev, e.id)} />
        ))}
        {!readOnly && structural.map((e) => (
          <line key={`hit-${e.id}`} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke="transparent" strokeWidth={14} style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onClick={(ev) => select(ev, e.id)} />
        ))}

        {linkSource && linking && (
          <path d={`M ${linkSource.x} ${linkSource.y} L ${linking.gx} ${linking.gy}`} fill="none" stroke={TOOL.accent} strokeWidth={1.6} strokeDasharray="4 4" style={{ pointerEvents: 'none' }} />
        )}
      </g>
    </svg>
  );
}

function ZoomControls({ scale, onIn, onOut, onFit }: { scale: number; onIn: () => void; onOut: () => void; onFit: () => void }) {
  const btn: React.CSSProperties = {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: TOOL.content,
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
  };
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.72)',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}
    >
      <button type="button" title="Zoom out" onClick={onOut} style={btn}>–</button>
      <span style={mono({ color: TOOL.mute, fontSize: 11, width: 42, textAlign: 'center' })}>{Math.round(scale * 100)}%</span>
      <button type="button" title="Zoom in" onClick={onIn} style={btn}>+</button>
      <span style={{ width: 1, height: 18, background: TOOL.border }} />
      <button type="button" title="Fit to view" onClick={onFit} style={{ ...btn, width: 36, fontSize: 11, ...ui({}) }}>Fit</button>
    </div>
  );
}

function Legend() {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: 16,
        bottom: 16,
        background: 'rgba(0,0,0,0.7)',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.12em' })}>EDGES · click to select</span>
      <LegendRow color="#3a3a3a" dashed={false} label="Structure" />
      <LegendRow color={TOOL.accent} dashed label="Reference · drag ○ to link" />

      <div style={{ height: 1, background: TOOL.border, margin: '2px 0' }} />

      <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.12em' })}>PROVENANCE</span>
      <LegendDotRow color={PROVENANCE_META['ai-generated'].color} label={PROVENANCE_META['ai-generated'].label} />
      <LegendDotRow color={PROVENANCE_META['human-edited'].color} label={PROVENANCE_META['human-edited'].label} />
      <LegendDotRow color={PROVENANCE_META.synced.color} label={PROVENANCE_META.synced.label} />
    </div>
  );
}

function LegendDotRow({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, margin: '0 8px' }} />
      <span style={ui({ color: TOOL.content, fontSize: 11 })}>{label}</span>
    </div>
  );
}

function LegendRow({ color, dashed, label }: { color: string; dashed: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="22" height="6">
        <line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="1.6" strokeDasharray={dashed ? '3 3' : undefined} />
      </svg>
      <span style={ui({ color: TOOL.content, fontSize: 11 })}>{label}</span>
    </div>
  );
}
