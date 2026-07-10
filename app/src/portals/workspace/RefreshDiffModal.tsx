import { useState } from 'react';
import type { ComponentKind, NodeContent, PortalNode } from '../types';
import { TOOL, ui, mono, label as labelStyle } from '../chrome/tokens';
import { Pill } from '../chrome/Pill';
import { Close, Sparkle, Columns } from '../chrome/Icons';
import { PageRenderer } from '../render/PageRenderer';

interface RefreshDiffModalProps {
  node: PortalNode;
  before: NodeContent;
  after: NodeContent;
  /** Open straight into the visual side-by-side view (e.g. from the Maintenance compare icon). */
  startVisual?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

type Mode = 'fields' | 'visual';

const FIELD_KIND: Partial<Record<keyof NodeContent, ComponentKind>> = {
  eyebrow: 'hero',
  title: 'hero',
  subtitle: 'hero',
  lead: 'hero',
  heroImage: 'hero',
  body: 'text-block',
  quote: 'pull-quote',
  images: 'image-grid',
  table: 'data-table',
  stats: 'stat-callout',
  cards: 'card-grid',
  links: 'link-list',
};

function changedKinds(before: NodeContent, after: NodeContent): Set<ComponentKind> {
  const kinds = new Set<ComponentKind>();
  (Object.keys(FIELD_KIND) as (keyof NodeContent)[]).forEach((key) => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) kinds.add(FIELD_KIND[key]!);
  });
  return kinds;
}

type TextField = 'eyebrow' | 'title' | 'subtitle' | 'lead';
const TEXT_FIELDS: { key: TextField; label: string }[] = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'lead', label: 'Lead' },
];

// Structured fields are summarised (count → count) rather than shown verbatim.
const STRUCT_FIELDS: { key: keyof NodeContent; noun: string }[] = [
  { key: 'body', noun: 'paragraphs' },
  { key: 'stats', noun: 'figures' },
  { key: 'images', noun: 'images' },
  { key: 'links', noun: 'links' },
  { key: 'cards', noun: 'cards' },
];

const len = (v: unknown): number => (Array.isArray(v) ? v.length : 0);

interface TextChange { kind: 'text'; label: string; before: string; after: string }
interface StructChange { kind: 'struct'; label: string; summary: string }
type Change = TextChange | StructChange;

function buildDiff(before: NodeContent, after: NodeContent): Change[] {
  const changes: Change[] = [];

  for (const { key, label } of TEXT_FIELDS) {
    const b = before[key] ?? '';
    const a = after[key] ?? '';
    if (b !== a) changes.push({ kind: 'text', label, before: b, after: a });
  }

  for (const { key, noun } of STRUCT_FIELDS) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes.push({ kind: 'struct', label: cap(String(key)), summary: `${len(before[key])} → ${len(after[key])} ${noun}` });
    }
  }

  if (JSON.stringify(before.quote) !== JSON.stringify(after.quote)) changes.push({ kind: 'struct', label: 'Quote', summary: 'Pull-quote revised' });
  if (JSON.stringify(before.table) !== JSON.stringify(after.table)) changes.push({ kind: 'struct', label: 'Table', summary: 'Data table revised' });

  return changes;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function RefreshDiffModal({ node, before, after, startVisual, onApprove, onReject }: RefreshDiffModalProps) {
  const [mode, setMode] = useState<Mode>(startVisual ? 'visual' : 'fields');
  const changes = buildDiff(before, after);
  const highlighted = changedKinds(before, after);

  return (
    <div onClick={onReject} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxWidth: mode === 'visual' ? 1040 : 600 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: `1px solid ${TOOL.border}` }}>
          <span style={{ color: TOOL.accent, display: 'inline-flex' }}><Sparkle size={16} /></span>
          <span style={ui({ color: TOOL.primary, fontSize: 15, fontWeight: 600 })}>Proposed update</span>
          <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.08em', marginLeft: 4 })}>{node.name.toUpperCase()}</span>

          <div style={{ display: 'flex', gap: 3, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 8, padding: 3, marginLeft: 16 }}>
            {(['fields', 'visual'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={ui({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                  background: mode === m ? TOOL.accent : 'transparent',
                  color: mode === m ? '#fff' : TOOL.mute,
                })}
              >
                {m === 'visual' && <Columns size={11} />}
                {m === 'fields' ? 'Fields' : 'Visual'}
              </button>
            ))}
          </div>

          <button type="button" onClick={onReject} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex' }}>
            <Close size={18} />
          </button>
        </div>

        {mode === 'fields' ? (
          <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={ui({ color: TOOL.content, fontSize: 13, lineHeight: 1.55, margin: 0 })}>
              The AI drafted a refresh from the latest source material. <strong style={{ color: TOOL.primary }}>Nothing is published
              until you approve.</strong> Review what changed:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={labelStyle({ color: TOOL.content })}>Changes</span>
              <span style={mono({ color: TOOL.accent, fontSize: 10 })}>● {changes.length} field{changes.length === 1 ? '' : 's'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {changes.map((c) => (c.kind === 'text' ? <TextDiff key={c.label} change={c} /> : <StructDiff key={c.label} change={c} />))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: TOOL.border }}>
            <VisualPane label="Current" node={node} content={before} highlighted={highlighted} />
            <VisualPane label="After refresh" node={node} content={after} highlighted={highlighted} accent />
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderTop: `1px solid ${TOOL.border}`, justifyContent: 'flex-end' }}>
          <Pill variant="ghost" onClick={onReject}>Reject</Pill>
          <Pill variant="accent" icon={<Sparkle />} onClick={onApprove}>Approve &amp; publish</Pill>
        </div>
      </div>
    </div>
  );
}

function VisualPane({ label, node, content, highlighted, accent }: { label: string; node: PortalNode; content: NodeContent; highlighted: Set<ComponentKind>; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: TOOL.bg }}>
      <div style={{ padding: '8px 14px', background: TOOL.panel, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent ? '#3ddc84' : TOOL.mute }} />
        <span style={mono({ color: TOOL.content, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase' })}>{label}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, maxHeight: 460 }}>
        <PageRenderer content={content} theme={node.theme} context={node.context} bare highlightKinds={accent ? highlighted : undefined} />
      </div>
    </div>
  );
}

function TextDiff({ change }: { change: TextChange }) {
  return (
    <div style={card}>
      <span style={fieldLabel}>{change.label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <DiffLine tone="old" text={change.before || '— empty —'} />
        <DiffLine tone="new" text={change.after || '— empty —'} />
      </div>
    </div>
  );
}

function StructDiff({ change }: { change: StructChange }) {
  return (
    <div style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <span style={fieldLabel}>{change.label}</span>
      <span style={ui({ color: TOOL.content, fontSize: 12.5, marginLeft: 'auto' })}>{change.summary}</span>
    </div>
  );
}

function DiffLine({ tone, text }: { tone: 'old' | 'new'; text: string }) {
  const isNew = tone === 'new';
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <span
        style={mono({
          color: isNew ? '#3ddc84' : TOOL.error,
          fontSize: 13,
          lineHeight: 1.5,
          flexShrink: 0,
          width: 12,
        })}
      >
        {isNew ? '+' : '−'}
      </span>
      <span
        style={ui({
          color: isNew ? TOOL.primary : TOOL.mute,
          fontSize: 12.5,
          lineHeight: 1.5,
          textDecoration: isNew ? 'none' : 'line-through',
          textDecorationColor: 'rgba(224,92,92,0.5)',
        })}
      >
        {text}
      </span>
    </div>
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
  maxWidth: 600,
  maxHeight: '86vh',
  background: TOOL.panel,
  border: `1px solid ${TOOL.border}`,
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const card: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  background: TOOL.bg,
  border: `1px solid ${TOOL.border}`,
  borderRadius: 10,
  padding: 13,
};

const fieldLabel: React.CSSProperties = mono({
  color: TOOL.faint,
  fontSize: 9,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
});
