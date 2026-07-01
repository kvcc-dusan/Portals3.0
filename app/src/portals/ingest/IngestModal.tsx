import { useMemo, useState } from 'react';
import type { CorporateContext, PortalNode, ThemeId } from '../types';
import { TOOL, ui, mono, label as labelStyle } from '../chrome/tokens';
import { Pill } from '../chrome/Pill';
import { Close, Sparkle, Trash, Chevron, Link } from '../chrome/Icons';
import { INGEST_RAW_TEXT, INGEST_PROPOSED, INGEST_CONNECTIONS, INITIAL_NODES, ROOT_ID } from '../data/graph';
import type { ConnectionSuggestion } from '../data/graph';
import { THEME_META } from '../render/themes';

type Phase = 'input' | 'generating' | 'proposed' | 'connections';

const connKey = (from: string, to: string) => `${from}:${to}`;

const CONTEXTS: CorporateContext[] = ['Company', 'Sustainability', 'Investor Relations', 'Newsroom', 'Brands'];
const THEMES: ThemeId[] = ['editorial', 'technical', 'index'];

/** Semantic tint per corporate context — makes "context" read as a tag, not a place. */
const CONTEXT_COLOR: Record<CorporateContext, string> = {
  Company: '#6e8bd6',
  Sustainability: '#3ddc84',
  'Investor Relations': '#d6a93d',
  Newsroom: '#46b8c5',
  Brands: '#e07ca8',
};

/** Existing top-level site areas the branch can attach under. */
const SITE_AREAS = Object.values(INITIAL_NODES)
  .filter((n) => n.parentId === ROOT_ID)
  .map((n) => ({ id: n.id, name: n.name }));

const DEFAULT_ATTACH_ID = INGEST_PROPOSED[0]?.parentId ?? 'area-newsroom';

interface IngestModalProps {
  onClose: () => void;
  onPlace: (proposed: PortalNode[]) => void;
}

const cloneProposed = (): PortalNode[] => INGEST_PROPOSED.map((n) => ({ ...n, content: { ...n.content } }));

export function IngestModal({ onClose, onPlace }: IngestModalProps) {
  const [text, setText] = useState(INGEST_RAW_TEXT);
  const [phase, setPhase] = useState<Phase>('input');
  const [proposed, setProposed] = useState<PortalNode[]>(cloneProposed);
  const [attachId, setAttachId] = useState(DEFAULT_ATTACH_ID);
  const [accepted, setAccepted] = useState<Set<string>>(() => new Set(INGEST_CONNECTIONS.map((c) => connKey(c.from, c.to))));

  const attachName = SITE_AREAS.find((a) => a.id === attachId)?.name ?? 'your site';
  const proposedIds = useMemo(() => new Set(proposed.map((n) => n.id)), [proposed]);

  // Suggestions whose source node still exists in the (possibly edited) branch.
  const liveConnections = useMemo(() => INGEST_CONNECTIONS.filter((c) => proposedIds.has(c.from)), [proposedIds]);
  const acceptedCount = liveConnections.filter((c) => accepted.has(connKey(c.from, c.to))).length;

  const toggleConnection = (from: string, to: string) =>
    setAccepted((prev) => {
      const next = new Set(prev);
      const k = connKey(from, to);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  // Merge accepted cross-links into each node's refs, then hand off to place.
  const place = () => {
    const merged = proposed.map((n) => {
      const extra = liveConnections.filter((c) => c.from === n.id && accepted.has(connKey(c.from, c.to))).map((c) => c.to);
      return { ...n, refs: Array.from(new Set([...n.refs, ...extra])) };
    });
    onPlace(merged);
  };

  const generate = () => {
    setPhase('generating');
    setTimeout(() => {
      setProposed(cloneProposed());
      setPhase('proposed');
    }, 1100);
  };

  // ── Edits on the proposed structure (CEO step 2: adjust before generation) ──
  const update = (id: string, change: Partial<PortalNode>) =>
    setProposed((p) => p.map((n) => (n.id === id ? { ...n, ...change } : n)));

  const remove = (id: string) =>
    setProposed((p) => {
      const target = p.find((n) => n.id === id);
      if (!target) return p;
      // delete the node; lift its children up to its parent so they aren't lost
      return p.filter((n) => n.id !== id).map((n) => (n.parentId === id ? { ...n, parentId: target.parentId } : n));
    });

  // Re-anchor the whole branch: every root (node parented outside the proposed set)
  // moves to the newly chosen existing area.
  const reanchor = (areaId: string) => {
    setAttachId(areaId);
    setProposed((p) => p.map((n) => (proposedIds.has(n.parentId ?? '') ? n : { ...n, parentId: areaId })));
  };

  const childrenOf = (parentId: string) => proposed.filter((n) => n.parentId === parentId);
  const roots = proposed.filter((n) => !proposedIds.has(n.parentId ?? ''));

  const descendantsOf = (id: string): Set<string> => {
    const out = new Set<string>();
    const walk = (pid: string) =>
      proposed.forEach((n) => {
        if (n.parentId === pid && !out.has(n.id)) {
          out.add(n.id);
          walk(n.id);
        }
      });
    walk(id);
    return out;
  };

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: `1px solid ${TOOL.border}` }}>
          <span style={{ color: TOOL.accent, display: 'inline-flex' }}><Sparkle size={16} /></span>
          <span style={ui({ color: TOOL.primary, fontSize: 15, fontWeight: 600 })}>Ingest content</span>
          <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.08em', marginLeft: 4 })}>
            {phase === 'connections' ? 'STEP 3 · CONNECT' : phase === 'proposed' ? 'STEP 2 · ADJUST STRUCTURE' : 'STEP 1 · RAW CONTENT'}
          </span>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex' }}>
            <Close size={18} />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {phase === 'input' || phase === 'generating' ? (
            <>
              <p style={ui({ color: TOOL.content, fontSize: 13, lineHeight: 1.55, margin: 0 })}>
                Paste a press release, brief or notes. The AI proposes <strong style={{ color: TOOL.primary }}>where this fits in your
                existing site</strong> — as a structure of nodes, not a finished page.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={labelStyle()}>Raw content</span>
                <textarea
                  className="pf-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={11}
                  style={ui({
                    background: TOOL.bg,
                    border: `1px solid ${TOOL.border}`,
                    borderRadius: 10,
                    color: TOOL.content,
                    fontSize: 13,
                    lineHeight: 1.6,
                    padding: 14,
                    resize: 'vertical',
                    outline: 'none',
                  })}
                />
              </div>
            </>
          ) : phase === 'proposed' ? (
            <>
              {/* Minimal attach header — also roots the tree (no duplicate anchor row) */}
              <div>
                <div style={attachHeader}>
                  <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.14em', flexShrink: 0 })}>ATTACHES UNDER</span>
                  <AttachSelect value={attachId} onChange={reanchor} options={SITE_AREAS} />
                  <span style={mono({ color: TOOL.faint, fontSize: 10, marginLeft: 'auto', flexShrink: 0 })}>
                    <span style={{ color: '#3ddc84' }}>●</span> {proposed.length} {proposed.length === 1 ? 'node' : 'nodes'}
                  </span>
                </div>
                <div style={branchRail}>
                  {roots.map((n) => (
                    <ProposedNode
                      key={n.id}
                      node={n}
                      proposed={proposed}
                      proposedIds={proposedIds}
                      attachId={attachId}
                      attachName={attachName}
                      childrenOf={childrenOf}
                      descendantsOf={descendantsOf}
                      onUpdate={update}
                      onRemove={remove}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <ConnectionsStep
              proposed={proposed}
              connections={liveConnections}
              accepted={accepted}
              onToggle={toggleConnection}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderTop: `1px solid ${TOOL.border}`, justifyContent: 'flex-end' }}>
          {phase === 'input' && <Pill variant="accent" icon={<Sparkle />} onClick={generate}>Generate structure</Pill>}
          {phase === 'generating' && <Pill variant="accent" icon={<Spinner />} disabled>Analysing content…</Pill>}
          {phase === 'proposed' && (
            <>
              <Pill variant="ghost" onClick={() => setPhase('input')}>Back</Pill>
              <Pill variant="accent" onClick={() => setPhase('connections')} disabled={proposed.length === 0}>
                Review connections →
              </Pill>
            </>
          )}
          {phase === 'connections' && (
            <>
              <span style={ui({ color: TOOL.mute, fontSize: 12, marginRight: 'auto' })}>
                {acceptedCount} connection{acceptedCount === 1 ? '' : 's'} will be created
              </span>
              <Pill variant="ghost" onClick={() => setPhase('proposed')}>Back</Pill>
              <Pill variant="accent" onClick={place} disabled={proposed.length === 0}>Place into site</Pill>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Editable proposed-node row (rename / recontext / retheme / reparent / delete) ──

interface ProposedNodeProps {
  node: PortalNode;
  proposed: PortalNode[];
  proposedIds: Set<string>;
  attachId: string;
  attachName: string;
  childrenOf: (parentId: string) => PortalNode[];
  descendantsOf: (id: string) => Set<string>;
  onUpdate: (id: string, change: Partial<PortalNode>) => void;
  onRemove: (id: string) => void;
}

function ProposedNode({ node, proposed, proposedIds, attachId, attachName, childrenOf, descendantsOf, onUpdate, onRemove }: ProposedNodeProps) {
  const [hover, setHover] = useState(false);
  const kids = childrenOf(node.id);
  const descendants = descendantsOf(node.id);
  const isPage = node.type === 'page';
  const isRoot = !proposedIds.has(node.parentId ?? ''); // parented to an existing area → branch root

  // Children can be re-parented within the branch (or up to the attach area); the
  // root's parent is owned by the attach card, so it has no Parent control.
  const parentOptions = [
    { id: attachId, name: attachName },
    ...proposed.filter((n) => n.id !== node.id && !descendants.has(n.id)).map((n) => ({ id: n.id, name: n.name })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          borderRadius: 11,
          border: `1px solid ${hover ? 'rgba(255,255,255,0.14)' : isPage ? '#242424' : TOOL.border}`,
          background: isPage ? '#161616' : '#0c0c0c',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'border-color 0.15s',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={isPage ? pageBadge : sectionBadge}>{node.type}</span>
          <input
            value={node.name}
            onChange={(e) => onUpdate(node.id, { name: e.target.value })}
            style={ui({ flex: 1, background: 'transparent', border: 'none', color: TOOL.primary, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', outline: 'none', minWidth: 0 })}
          />
          <button
            type="button"
            title="Delete node"
            onClick={() => onRemove(node.id)}
            style={{ background: 'none', border: 'none', color: hover ? TOOL.mute : TOOL.faint, cursor: 'pointer', display: 'inline-flex', flexShrink: 0, transition: 'color 0.15s' }}
          >
            <Trash size={14} />
          </button>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Field label="Context">
            <Select
              value={node.context}
              onChange={(v) => onUpdate(node.id, { context: v as CorporateContext })}
              options={CONTEXTS.map((c) => ({ value: c, label: c, dot: CONTEXT_COLOR[c] }))}
            />
          </Field>
          <Field label="Theme">
            <Select value={node.theme} onChange={(v) => onUpdate(node.id, { theme: v as ThemeId })} options={THEMES.map((t) => ({ value: t, label: THEME_META[t].label }))} />
          </Field>
          {!isRoot && (
            <Field label="Parent">
              <Select value={node.parentId ?? attachId} onChange={(v) => onUpdate(node.id, { parentId: v })} options={parentOptions.map((p) => ({ value: p.id, label: p.name }))} />
            </Field>
          )}
        </div>
      </div>

      {kids.length > 0 && (
        <div style={branchRail}>
          {kids.map((c) => (
            <ProposedNode
              key={c.id}
              node={c}
              proposed={proposed}
              proposedIds={proposedIds}
              attachId={attachId}
              attachName={attachName}
              childrenOf={childrenOf}
              descendantsOf={descendantsOf}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Connect step: AI-proposed cross-links into the existing graph ──────────────

interface ConnectionsStepProps {
  proposed: PortalNode[];
  connections: ConnectionSuggestion[];
  accepted: Set<string>;
  onToggle: (from: string, to: string) => void;
}

function ConnectionsStep({ proposed, connections, accepted, onToggle }: ConnectionsStepProps) {
  const sources = proposed.filter((n) => connections.some((c) => c.from === n.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={ui({ color: TOOL.content, fontSize: 13, lineHeight: 1.55, margin: 0 })}>
        These nodes don't just sit under one area — they <strong style={{ color: TOOL.primary }}>wire into related
        content</strong> across your site. The AI suggests these cross-links; keep the ones that make sense.
      </p>

      {sources.map((src) => {
        const rows = connections.filter((c) => c.from === src.id);
        return (
          <div key={src.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={src.type === 'page' ? pageBadge : sectionBadge}>{src.type}</span>
              <span style={ui({ color: TOOL.primary, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em' })}>{src.name}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {rows.map((c) => (
                <ConnectionRow key={c.to} conn={c} on={accepted.has(connKey(c.from, c.to))} onToggle={() => onToggle(c.from, c.to)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConnectionRow({ conn, on, onToggle }: { conn: ConnectionSuggestion; on: boolean; onToggle: () => void }) {
  const target = INITIAL_NODES[conn.to];
  const tint = target ? CONTEXT_COLOR[target.context] : TOOL.mute;

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        textAlign: 'left',
        background: on ? 'rgba(83,20,255,0.06)' : 'transparent',
        border: `1px solid ${on ? 'rgba(83,20,255,0.4)' : TOOL.border}`,
        borderRadius: 9,
        padding: '9px 12px',
        cursor: 'pointer',
        opacity: on ? 1 : 0.55,
        transition: 'opacity 0.15s, border-color 0.15s, background 0.15s',
      }}
    >
      <span
        style={{
          width: 17,
          height: 17,
          borderRadius: 5,
          flexShrink: 0,
          border: `1.5px solid ${on ? TOOL.accent : TOOL.mute}`,
          background: on ? TOOL.accent : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        {on && <CheckMark />}
      </span>
      <span style={{ color: tint, display: 'inline-flex', flexShrink: 0 }}><Link size={13} /></span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={ui({ color: TOOL.primary, fontSize: 13, fontWeight: 500, textDecoration: on ? 'none' : 'line-through' })}>
          {target?.name ?? conn.to}
        </span>
        <span style={ui({ color: TOOL.mute, fontSize: 11.5, lineHeight: 1.35 })}>{conn.reason}</span>
      </span>
    </button>
  );
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 120px', minWidth: 0 }}>
      <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.1em' })}>{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

interface Option {
  value: string;
  label: string;
  dot?: string;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Option[] }) {
  const [focus, setFocus] = useState(false);
  const active = options.find((o) => o.value === value);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: TOOL.panel,
        border: `1px solid ${focus ? TOOL.accent : TOOL.border}`,
        borderRadius: 8,
        height: 34,
        paddingLeft: active?.dot ? 10 : 11,
        transition: 'border-color 0.15s',
        boxShadow: focus ? `0 0 0 3px rgba(83,20,255,0.18)` : 'none',
      }}
    >
      {active?.dot && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: active.dot, flexShrink: 0, marginRight: 8 }} />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={ui({
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'transparent',
          border: 'none',
          color: TOOL.content,
          fontSize: 12.5,
          fontWeight: 500,
          padding: 0,
          paddingRight: 22,
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
          textOverflow: 'ellipsis',
        })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: TOOL.panel, color: TOOL.content }}>{o.label}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 9, color: TOOL.mute, display: 'inline-flex', pointerEvents: 'none' }}>
        <Chevron size={13} />
      </span>
    </div>
  );
}

/** The prominent attach-point selector — a heading-sized select. */
function AttachSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; name: string }[] }) {
  const [focus, setFocus] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        background: focus ? 'rgba(83,20,255,0.16)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focus ? TOOL.accent : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 8,
        height: 30,
        paddingLeft: 11,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={ui({
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'transparent',
          border: 'none',
          color: TOOL.primary,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          padding: 0,
          paddingRight: 26,
          outline: 'none',
          cursor: 'pointer',
        })}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} style={{ background: TOOL.panel, color: TOOL.content, fontSize: 13 }}>{o.name}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 9, color: TOOL.accent, display: 'inline-flex', pointerEvents: 'none' }}>
        <Chevron size={14} />
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

const panel: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  maxHeight: '88vh',
  background: TOOL.panel,
  border: `1px solid ${TOOL.border}`,
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const attachHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  paddingBottom: 6,
};

const branchRail: React.CSSProperties = {
  marginLeft: 13,
  borderLeft: `1px solid ${TOOL.border}`,
  paddingLeft: 16,
  marginTop: 6,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const badgeBase: React.CSSProperties = mono({
  fontSize: 8.5,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderRadius: 5,
  padding: '3px 7px',
  flexShrink: 0,
});

// Page = the bright "parent" chip; Section = a quiet outline chip.
const pageBadge: React.CSSProperties = { ...badgeBase, color: '#0c0c0c', background: 'rgba(255,255,255,0.92)', fontWeight: 600 };
const sectionBadge: React.CSSProperties = { ...badgeBase, color: TOOL.mute, background: 'transparent', border: `1px solid ${TOOL.border}` };
