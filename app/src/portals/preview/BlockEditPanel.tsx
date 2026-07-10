import { useState } from 'react';
import type { ComponentKind, NodeContent } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { Pill } from '../chrome/Pill';
import { Close, Sparkle } from '../chrome/Icons';
import { getAiEditedField } from '../data/graph';

interface BlockEditPanelProps {
  nodeId: string;
  kind: ComponentKind;
  content: NodeContent;
  onApply: (change: Partial<NodeContent>) => void;
  onClose: () => void;
}

const KIND_TITLE: Record<ComponentKind, string> = {
  hero: 'Hero',
  'pull-quote': 'Pull quote',
  'text-block': 'Text',
  'image-grid': 'Image grid',
  'data-table': 'Data table',
  'stat-callout': 'Stat callout',
  'card-grid': 'Card grid',
  'link-list': 'Link list',
};

const SUGGESTIONS = ['Make it more concise', 'More formal tone', 'Emphasise sustainability'];

/** Block-level editor for Preview — not a visual builder, just this block's fields. */
export function BlockEditPanel({ nodeId, kind, content, onApply, onClose }: BlockEditPanelProps) {
  const [tab, setTab] = useState<'manual' | 'ai'>('manual');
  const [prompt, setPrompt] = useState('');
  const [thinking, setThinking] = useState(false);

  const runAi = () => {
    if (thinking) return;
    setThinking(true);
    setTimeout(() => {
      onApply(getAiEditedField(nodeId, kind, content));
      setThinking(false);
    }, 900);
  };

  return (
    <div style={{ width: 300, flexShrink: 0, background: TOOL.panel, borderLeft: `1px solid ${TOOL.border}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${TOOL.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={ui({ color: TOOL.primary, fontSize: 13, fontWeight: 600 })}>Edit {KIND_TITLE[kind]}</span>
        <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex' }}>
          <Close size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 3, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 8, padding: 3, margin: 14 }}>
        {(['manual', 'ai'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={ui({
              flex: 1,
              padding: '6px 0',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 500,
              background: tab === t ? TOOL.accent : 'transparent',
              color: tab === t ? '#fff' : TOOL.mute,
            })}
          >
            {t === 'manual' ? 'Manual' : 'AI'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'manual' ? (
          <ManualFields key={kind} kind={kind} content={content} onApply={onApply} />
        ) : (
          <>
            <p style={ui({ color: TOOL.content, fontSize: 12, lineHeight: 1.5, margin: 0 })}>
              Describe the change — the AI rewrites this block only.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  style={ui({
                    padding: '5px 10px',
                    borderRadius: 100,
                    border: `1px solid ${TOOL.border}`,
                    background: prompt === s ? 'rgba(83,20,255,0.14)' : 'transparent',
                    color: TOOL.content,
                    fontSize: 11,
                    cursor: 'pointer',
                  })}
                >
                  {s}
                </button>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Make it more concise"
              rows={3}
              style={ui({
                background: TOOL.bg,
                border: `1px solid ${TOOL.border}`,
                borderRadius: 8,
                color: TOOL.content,
                fontSize: 12.5,
                padding: 10,
                resize: 'vertical',
                outline: 'none',
              })}
            />
            <Pill variant="accent" icon={thinking ? <Spinner /> : <Sparkle />} onClick={runAi} disabled={thinking}>
              {thinking ? 'Rewriting…' : 'Rewrite block'}
            </Pill>
          </>
        )}
      </div>
    </div>
  );
}

// ── Manual field editors, one per block kind ────────────────────────────────

function ManualFields({ kind, content, onApply }: { kind: ComponentKind; content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  switch (kind) {
    case 'hero':
      return <HeroFields content={content} onApply={onApply} />;
    case 'text-block':
      return <TextFields content={content} onApply={onApply} />;
    case 'pull-quote':
      return <QuoteFields content={content} onApply={onApply} />;
    case 'stat-callout':
      return <StatFields content={content} onApply={onApply} />;
    case 'card-grid':
      return <CardFields content={content} onApply={onApply} />;
    case 'link-list':
      return <LinkFields content={content} onApply={onApply} />;
    case 'image-grid':
      return <ImageFields content={content} onApply={onApply} />;
    case 'data-table':
      return <TableFields content={content} onApply={onApply} />;
  }
}

function HeroFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [eyebrow, setEyebrow] = useState(content.eyebrow ?? '');
  const [title, setTitle] = useState(content.title ?? '');
  const [subtitle, setSubtitle] = useState(content.subtitle ?? '');
  const [lead, setLead] = useState(content.lead ?? '');

  return (
    <>
      <Field label="Eyebrow"><Input value={eyebrow} onChange={setEyebrow} /></Field>
      <Field label="Title"><Input value={title} onChange={setTitle} /></Field>
      <Field label="Subtitle"><Input value={subtitle} onChange={setSubtitle} /></Field>
      <Field label="Lead"><TextArea value={lead} onChange={setLead} rows={4} /></Field>
      <ApplyButton onClick={() => onApply({ eyebrow, title, subtitle, lead })} />
    </>
  );
}

function TextFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [text, setText] = useState((content.body ?? []).join('\n\n'));
  const apply = () => onApply({ body: text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) });
  return (
    <>
      <Field label="Paragraphs (blank line separates)"><TextArea value={text} onChange={setText} rows={10} /></Field>
      <ApplyButton onClick={apply} />
    </>
  );
}

function QuoteFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [text, setText] = useState(content.quote?.text ?? '');
  const [attribution, setAttribution] = useState(content.quote?.attribution ?? '');
  return (
    <>
      <Field label="Quote"><TextArea value={text} onChange={setText} rows={4} /></Field>
      <Field label="Attribution"><Input value={attribution} onChange={setAttribution} /></Field>
      <ApplyButton onClick={() => onApply({ quote: { text, attribution } })} />
    </>
  );
}

function StatFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [stats, setStats] = useState(content.stats ?? []);
  const update = (i: number, key: 'value' | 'label', v: string) =>
    setStats((s) => s.map((st, idx) => (idx === i ? { ...st, [key]: v } : st)));
  return (
    <>
      {stats.map((st, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <Field label="Value"><Input value={st.value} onChange={(v) => update(i, 'value', v)} /></Field>
          <Field label="Label"><Input value={st.label} onChange={(v) => update(i, 'label', v)} /></Field>
        </div>
      ))}
      <ApplyButton onClick={() => onApply({ stats })} />
    </>
  );
}

function CardFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [cards, setCards] = useState(content.cards ?? []);
  const update = (i: number, key: 'title' | 'meta' | 'blurb', v: string) =>
    setCards((c) => c.map((card, idx) => (idx === i ? { ...card, [key]: v } : card)));
  return (
    <>
      {cards.map((c, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 8, borderBottom: i < cards.length - 1 ? `1px solid ${TOOL.border}` : 'none' }}>
          <Field label="Title"><Input value={c.title} onChange={(v) => update(i, 'title', v)} /></Field>
          <Field label="Meta"><Input value={c.meta ?? ''} onChange={(v) => update(i, 'meta', v)} /></Field>
          <Field label="Blurb"><TextArea value={c.blurb ?? ''} onChange={(v) => update(i, 'blurb', v)} rows={2} /></Field>
        </div>
      ))}
      <ApplyButton onClick={() => onApply({ cards })} />
    </>
  );
}

function LinkFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [links, setLinks] = useState(content.links ?? []);
  const update = (i: number, key: 'label' | 'meta', v: string) =>
    setLinks((l) => l.map((link, idx) => (idx === i ? { ...link, [key]: v } : link)));
  return (
    <>
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <Field label="Label"><Input value={l.label} onChange={(v) => update(i, 'label', v)} /></Field>
          <Field label="Meta"><Input value={l.meta ?? ''} onChange={(v) => update(i, 'meta', v)} /></Field>
        </div>
      ))}
      <ApplyButton onClick={() => onApply({ links })} />
    </>
  );
}

function ImageFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [images, setImages] = useState(content.images ?? []);
  const update = (i: number, v: string) => setImages((im) => im.map((img, idx) => (idx === i ? { ...img, caption: v } : img)));
  return (
    <>
      <p style={ui({ color: TOOL.faint, fontSize: 11, lineHeight: 1.5, margin: 0 })}>Captions only — swapping images isn't wired up in this demo.</p>
      {images.map((img, i) => (
        <Field key={i} label={`Caption ${i + 1}`}><Input value={img.caption ?? ''} onChange={(v) => update(i, v)} /></Field>
      ))}
      <ApplyButton onClick={() => onApply({ images })} />
    </>
  );
}

function TableFields({ content, onApply }: { content: NodeContent; onApply: (c: Partial<NodeContent>) => void }) {
  const [caption, setCaption] = useState(content.table?.caption ?? '');
  return (
    <>
      <p style={ui({ color: TOOL.faint, fontSize: 11, lineHeight: 1.5, margin: 0 })}>Only the caption is editable here — row edits aren't wired up in this demo.</p>
      <Field label="Caption"><Input value={caption} onChange={setCaption} /></Field>
      <ApplyButton onClick={() => onApply({ table: content.table ? { ...content.table, caption } : content.table })} />
    </>
  );
}

// ── Shared field primitives ─────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 0 }}>
      <span style={mono({ color: TOOL.faint, fontSize: 9, letterSpacing: '0.1em' })}>{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={ui({
        background: TOOL.bg,
        border: `1px solid ${TOOL.border}`,
        borderRadius: 7,
        color: TOOL.content,
        fontSize: 12.5,
        padding: '8px 10px',
        outline: 'none',
        width: '100%',
      })}
    />
  );
}

function TextArea({ value, onChange, rows }: { value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={ui({
        background: TOOL.bg,
        border: `1px solid ${TOOL.border}`,
        borderRadius: 7,
        color: TOOL.content,
        fontSize: 12.5,
        lineHeight: 1.5,
        padding: 10,
        outline: 'none',
        resize: 'vertical',
        width: '100%',
      })}
    />
  );
}

function ApplyButton({ onClick }: { onClick: () => void }) {
  return (
    <Pill variant="solid" onClick={onClick}>Apply</Pill>
  );
}

function Spinner() {
  return (
    <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
  );
}
