import { useState } from 'react';
import type { Binding, CorporateContext, NodeContent, PortalNode, ThemeId } from '../types';
import { TOOL, ui, mono, label as labelStyle } from '../chrome/tokens';
import { Pill } from '../chrome/Pill';
import { Eye, Columns, Link, Sparkle, Plus } from '../chrome/Icons';
import { ProvenanceBadge } from '../chrome/Provenance';
import { suggestReferences, type RefSuggestion } from '../data/suggest';
import { DATA_SOURCES, SOURCE_FIELDS, sourceById, fieldOf } from '../data/sources';
import { THEME_META } from '../render/themes';

const CONTEXTS: CorporateContext[] = ['Company', 'Sustainability', 'Investor Relations', 'Newsroom', 'Brands'];
const THEMES: ThemeId[] = ['editorial', 'technical', 'index'];

interface InspectorProps {
  node: PortalNode | null;
  nodes: Record<string, PortalNode>;
  onRename: (id: string, name: string) => void;
  onContext: (id: string, ctx: CorporateContext) => void;
  onTheme: (id: string, theme: ThemeId) => void;
  onReparent: (id: string, parentId: string) => void;
  onEditContent: (id: string, change: Partial<NodeContent>) => void;
  onPreview: () => void;
  onCompare: () => void;
  onRefresh: (id: string) => void;
  onGenerate: (id: string) => void;
  onAddRef: (from: string, to: string) => void;
  onBindStat: (nodeId: string, statIndex: number, sourceId: string, fieldKey: string) => void;
  onSyncBinding: (nodeId: string, statIndex: number) => void;
  onUnbindStat: (nodeId: string, statIndex: number) => void;
}

export function Inspector(props: InspectorProps) {
  const { node } = props;
  return (
    <aside
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 320,
        background: TOOL.panel,
        borderLeft: `1px solid ${TOOL.border}`,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {node ? <Body key={node.id} {...props} node={node} /> : <Empty />}
    </aside>
  );
}

function Empty() {
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      <span style={{ color: TOOL.faint, display: 'inline-flex' }}><Sparkle size={22} /></span>
      <p style={ui({ color: TOOL.mute, fontSize: 13, lineHeight: 1.5, maxWidth: 200 })}>
        Select a node on the canvas to inspect its content, context and theme.
      </p>
    </div>
  );
}

function Body({ node, nodes, onRename, onContext, onTheme, onReparent, onEditContent, onPreview, onCompare, onRefresh, onGenerate, onAddRef, onBindStat, onSyncBinding, onUnbindStat }: InspectorProps & { node: PortalNode }) {
  const [refreshPhase, setRefreshPhase] = useState<'idle' | 'working'>('idle');
  const [generating, setGenerating] = useState(false);
  const [suggestPhase, setSuggestPhase] = useState<'idle' | 'working' | 'done'>('idle');
  const [suggestions, setSuggestions] = useState<RefSuggestion[]>([]);

  // On-demand "AI" link suggestions (B4) — drafts candidate cross-links.
  const suggestLinks = () => {
    setSuggestPhase('working');
    setTimeout(() => {
      setSuggestions(suggestReferences(node, nodes));
      setSuggestPhase('done');
    }, 800);
  };

  const acceptSuggestion = (to: string) => {
    onAddRef(node.id, to);
    setSuggestions((prev) => prev.filter((s) => s.to !== to));
  };

  // Content editing (D1)
  const body = node.content.body ?? [];
  const setParagraph = (i: number, text: string) => onEditContent(node.id, { body: body.map((p, j) => (j === i ? text : p)) });
  const addParagraph = () => onEditContent(node.id, { body: [...body, ''] });
  const removeParagraph = (i: number) => onEditContent(node.id, { body: body.filter((_, j) => j !== i) });

  // Drafts a refresh, then hands a diff to the approval modal (commit happens there).
  const refresh = () => {
    setRefreshPhase('working');
    setTimeout(() => {
      onRefresh(node.id);
      setRefreshPhase('idle');
    }, 1000);
  };

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onGenerate(node.id);
    }, 1000);
  };

  // Exclude self and all descendants so a node can never be reparented into its
  // own subtree (which would create a structural cycle).
  const descendants = new Set<string>();
  const collect = (id: string) =>
    Object.values(nodes).forEach((n) => {
      if (n.parentId === id && !descendants.has(n.id)) {
        descendants.add(n.id);
        collect(n.id);
      }
    });
  collect(node.id);
  const parentOptions = Object.values(nodes).filter(
    (n) => n.id !== node.id && !descendants.has(n.id) && (n.type === 'site' || n.type === 'page' || n.type === 'section'),
  );
  const refNodes = node.refs.map((r) => nodes[r]).filter(Boolean);
  const components = countComponents(node);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle({ fontWeight: 600, color: TOOL.content })}>Inspector</span>
          <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.08em' })}>{node.type.toUpperCase()}</span>
        </div>
        <span style={mono({ color: TOOL.faint, fontSize: 10 })}>{node.id}</span>
      </div>

      <ProvenanceBadge origin={node.origin ?? 'human-edited'} updatedAt={node.updatedAt} />

      <Field label="Name">
        <input
          className="pf-input"
          value={node.name}
          onChange={(e) => onRename(node.id, e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Corporate context">
        <select className="pf-input" value={node.context} onChange={(e) => onContext(node.id, e.target.value as CorporateContext)} style={inputStyle}>
          {CONTEXTS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Theme">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 8, padding: 4 }}>
            {THEMES.map((t) => {
              const active = node.theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTheme(node.id, t)}
                  style={ui({
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? TOOL.accent : 'transparent',
                    color: active ? '#fff' : TOOL.mute,
                  })}
                >
                  {THEME_META[t].label}
                </button>
              );
            })}
          </div>
          <span style={ui({ color: TOOL.faint, fontSize: 11, lineHeight: 1.4 })}>{THEME_META[node.theme].note}</span>
        </div>
      </Field>

      <Field label="Parent">
        <select
          className="pf-input"
          value={node.parentId ?? ''}
          onChange={(e) => onReparent(node.id, e.target.value)}
          disabled={node.type === 'site'}
          style={{ ...inputStyle, opacity: node.type === 'site' ? 0.5 : 1 }}
        >
          {node.type === 'site' ? (
            <option value="">— (root)</option>
          ) : (
            parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
          )}
        </select>
      </Field>

      <Divider />

      {/* Content fields — editable (D1) */}
      {node.type !== 'site' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={labelStyle()}>Content</span>

          <EditRow label="Title">
            <input className="pf-input" value={node.content.title ?? ''} onChange={(e) => onEditContent(node.id, { title: e.target.value })} placeholder="Add a title…" style={inputStyle} />
          </EditRow>

          <EditRow label="Lead">
            <textarea className="pf-input" value={node.content.lead ?? ''} onChange={(e) => onEditContent(node.id, { lead: e.target.value })} placeholder="Add a lead…" rows={3} style={textareaStyle} />
          </EditRow>

          <EditRow label="Body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {body.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <textarea className="pf-input" value={p} onChange={(e) => setParagraph(i, e.target.value)} placeholder={`Paragraph ${i + 1}…`} rows={2} style={{ ...textareaStyle, flex: 1 }} />
                  <button type="button" title="Remove paragraph" onClick={() => removeParagraph(i)} style={{ background: 'none', border: `1px solid ${TOOL.border}`, borderRadius: 6, color: TOOL.faint, cursor: 'pointer', width: 26, height: 26, flexShrink: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ))}
              <button type="button" onClick={addParagraph} style={ui({ alignSelf: 'flex-start', background: 'none', border: `1px dashed ${TOOL.border}`, borderRadius: 6, color: TOOL.mute, cursor: 'pointer', fontSize: 11.5, padding: '5px 10px' })}>
                + Add paragraph
              </button>
            </div>
          </EditRow>

          <div>
            <span style={ui({ color: TOOL.faint, fontSize: 11 })}>Composes</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {components.map((c) => (
                <span key={c} style={mono({ fontSize: 10, color: TOOL.content, border: `1px solid ${TOOL.border}`, borderRadius: 4, padding: '3px 7px' })}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live data — bind stats to corporate sources (Flow C) */}
      {(node.content.stats?.length ?? 0) > 0 && node.type !== 'site' && (
        <>
          <Divider />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={labelStyle()}>Live data</span>
            {(node.content.stats ?? []).map((stat, i) => (
              <StatBindingRow
                key={i}
                stat={stat}
                binding={node.bindings.find((b) => b.statIndex === i)}
                onSync={() => onSyncBinding(node.id, i)}
                onUnbind={() => onUnbindStat(node.id, i)}
                onBind={(sourceId, fieldKey) => onBindStat(node.id, i, sourceId, fieldKey)}
              />
            ))}
          </div>
        </>
      )}

      {/* References + on-demand link suggestions */}
      {node.type !== 'site' && (
        <>
          <Divider />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={labelStyle()}>References</span>
              <span style={mono({ color: TOOL.faint, fontSize: 10, marginLeft: 'auto' })}>{refNodes.length}</span>
            </div>

            {refNodes.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: TOOL.accent, flexShrink: 0 }} />
                <span style={ui({ color: TOOL.content, fontSize: 12 })}>{r.name}</span>
              </div>
            ))}

            {refNodes.length === 0 && suggestPhase === 'idle' && (
              <span style={ui({ color: TOOL.faint, fontSize: 12 })}>No cross-links yet.</span>
            )}

            {suggestPhase === 'done' && suggestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                <span style={mono({ color: TOOL.accent, fontSize: 9, letterSpacing: '0.12em' })}>SUGGESTED</span>
                {suggestions.map((s) => (
                  <SuggestionRow key={s.to} suggestion={s} targetName={nodes[s.to]?.name ?? s.to} onAccept={() => acceptSuggestion(s.to)} />
                ))}
              </div>
            )}

            {suggestPhase === 'done' && suggestions.length === 0 && (
              <span style={ui({ color: TOOL.faint, fontSize: 12 })}>No new links found.</span>
            )}

            <Pill variant="ghost" size="sm" icon={suggestPhase === 'working' ? <Spinner /> : <Sparkle />} onClick={suggestLinks} disabled={suggestPhase === 'working'}>
              {suggestPhase === 'working' ? 'Finding links…' : suggestPhase === 'done' ? 'Suggest more' : 'Suggest links'}
            </Pill>
          </div>
        </>
      )}

      <Divider />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {node.type !== 'site' && (
          <Pill
            variant="accent"
            icon={refreshPhase === 'working' ? <Spinner /> : <Sparkle />}
            onClick={refresh}
            disabled={refreshPhase !== 'idle'}
          >
            {refreshPhase === 'working' ? 'Drafting update…' : 'Refresh section'}
          </Pill>
        )}

        {node.rendered === false ? (
          <Pill variant="accent" icon={generating ? <Spinner /> : <Sparkle />} onClick={generate} disabled={generating}>
            {generating ? 'Generating page…' : 'Generate page'}
          </Pill>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><Pill variant="ghost" icon={<Eye />} onClick={onPreview}>Preview</Pill></div>
            <div style={{ flex: 1 }}><Pill variant="ghost" icon={<Columns />} onClick={onCompare}>Compare</Pill></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field primitives ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={labelStyle()}>{label}</span>
      {children}
    </div>
  );
}

type Stat = NonNullable<NodeContent['stats']>[number];

function StatBindingRow({
  stat,
  binding,
  onSync,
  onUnbind,
  onBind,
}: {
  stat: Stat;
  binding: Binding | undefined;
  onSync: () => void;
  onUnbind: () => void;
  onBind: (sourceId: string, fieldKey: string) => void;
}) {
  const field = binding ? fieldOf(binding.sourceId, binding.fieldKey) : undefined;
  const stale = !!field && !!binding && field.value !== binding.syncedValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: `1px solid ${binding ? (stale ? 'rgba(214,169,61,0.4)' : TOOL.border) : TOOL.border}`, borderRadius: 9, padding: '10px 11px', background: TOOL.bg }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {binding && <span title="Bound to a live source" style={{ width: 6, height: 6, borderRadius: '50%', background: stale ? '#d6a93d' : '#3ddc84', flexShrink: 0, alignSelf: 'center' }} />}
        <span style={ui({ color: TOOL.primary, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' })}>{stat.value}</span>
        <span style={ui({ color: TOOL.mute, fontSize: 11.5, marginLeft: 'auto', textAlign: 'right' })}>{stat.label}</span>
      </div>

      {binding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color: TOOL.accent, display: 'inline-flex', flexShrink: 0 }}><Link size={12} /></span>
            <span style={mono({ color: TOOL.content, fontSize: 11 })}>{sourceById(binding.sourceId)?.name ?? binding.sourceId}</span>
            {stale ? (
              <span style={mono({ color: '#d6a93d', fontSize: 9.5, letterSpacing: '0.06em', border: '1px solid rgba(214,169,61,0.4)', borderRadius: 4, padding: '2px 6px', marginLeft: 'auto' })}>STALE</span>
            ) : (
              <span style={mono({ color: TOOL.faint, fontSize: 10, marginLeft: 'auto' })}>synced {binding.syncedAt}</span>
            )}
            <button type="button" title="Unbind" onClick={onUnbind} style={{ background: 'none', border: 'none', color: TOOL.faint, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
          </div>
          {stale && (
            <button
              type="button"
              onClick={onSync}
              style={ui({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(83,20,255,0.12)', border: `1px solid ${TOOL.accent}`, borderRadius: 7, color: TOOL.primary, fontSize: 12, fontWeight: 500, padding: '7px 10px', cursor: 'pointer' })}
            >
              <span style={{ color: TOOL.accent, display: 'inline-flex' }}><Sparkle size={12} /></span>
              Sync to {field?.value}
            </button>
          )}
        </div>
      ) : (
        <select
          className="pf-input"
          value=""
          onChange={(e) => {
            const [sid, key] = e.target.value.split('::');
            if (sid && key) onBind(sid, key);
          }}
          style={{ ...inputStyle, fontSize: 12, padding: '7px 9px', color: TOOL.mute }}
        >
          <option value="">Bind to a source…</option>
          {DATA_SOURCES.map((s) => (
            <optgroup key={s.id} label={s.name}>
              {SOURCE_FIELDS.filter((f) => f.sourceId === s.id).map((f) => (
                <option key={f.key} value={`${s.id}::${f.key}`}>{f.label} — {f.value}</option>
              ))}
            </optgroup>
          ))}
        </select>
      )}
    </div>
  );
}

function SuggestionRow({ suggestion, targetName, onAccept }: { suggestion: RefSuggestion; targetName: string; onAccept: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        border: `1px solid ${TOOL.border}`,
        borderRadius: 8,
        padding: '8px 9px 8px 11px',
        background: TOOL.bg,
      }}
    >
      <span style={{ color: TOOL.accent, display: 'inline-flex', flexShrink: 0 }}><Link size={12} /></span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={ui({ color: TOOL.content, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>{targetName}</span>
        <span style={ui({ color: TOOL.faint, fontSize: 11, lineHeight: 1.3 })}>{suggestion.reason}</span>
      </div>
      <button
        type="button"
        title={`Link to ${targetName}`}
        onClick={onAccept}
        style={{
          marginLeft: 'auto',
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 6,
          border: `1px solid ${TOOL.accent}`,
          background: 'rgba(83,20,255,0.12)',
          color: TOOL.accent,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={ui({ color: TOOL.faint, fontSize: 11 })}>{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: TOOL.border }} />;
}

function Spinner() {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

// Border lives in the .pf-input class so its hover/focus states aren't blocked
// by an inline shorthand (inline always beats stylesheet rules).
const inputStyle: React.CSSProperties = {
  ...ui({}),
  background: TOOL.bg,
  borderRadius: 8,
  color: TOOL.content,
  fontSize: 13,
  padding: '9px 10px',
  width: '100%',
  outline: 'none',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  lineHeight: 1.5,
  resize: 'vertical',
};

function countComponents(node: PortalNode): string[] {
  const c = node.content;
  const present: string[] = [];
  if (c.title || c.heroImage || c.lead) present.push('hero');
  if (c.body?.length) present.push('text-block');
  if (c.quote) present.push('pull-quote');
  if (c.images?.length) present.push('image-grid');
  if (c.table) present.push('data-table');
  if (c.stats?.length) present.push('stat-callout');
  if (c.cards?.length) present.push('card-grid');
  if (c.links?.length) present.push('link-list');
  return present;
}
