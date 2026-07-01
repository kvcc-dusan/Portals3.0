import type { NodeContent, PortalNode } from '../types';
import { TOOL, ui, mono, label as labelStyle } from '../chrome/tokens';
import { Pill } from '../chrome/Pill';
import { Close, Sparkle } from '../chrome/Icons';

interface RefreshDiffModalProps {
  node: PortalNode;
  before: NodeContent;
  after: NodeContent;
  onApprove: () => void;
  onReject: () => void;
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

export function RefreshDiffModal({ node, before, after, onApprove, onReject }: RefreshDiffModalProps) {
  const changes = buildDiff(before, after);

  return (
    <div onClick={onReject} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: `1px solid ${TOOL.border}` }}>
          <span style={{ color: TOOL.accent, display: 'inline-flex' }}><Sparkle size={16} /></span>
          <span style={ui({ color: TOOL.primary, fontSize: 15, fontWeight: 600 })}>Proposed update</span>
          <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.08em', marginLeft: 4 })}>{node.name.toUpperCase()}</span>
          <button type="button" onClick={onReject} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex' }}>
            <Close size={18} />
          </button>
        </div>

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

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderTop: `1px solid ${TOOL.border}`, justifyContent: 'flex-end' }}>
          <Pill variant="ghost" onClick={onReject}>Reject</Pill>
          <Pill variant="accent" icon={<Sparkle />} onClick={onApprove}>Approve &amp; publish</Pill>
        </div>
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
