import { useState } from 'react';
import type { PortalNode } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { Plus, ArrowUp, Close, Sparkle } from '../chrome/Icons';
import { matchCommand, findDrift, type DriftSummary } from '../data/commands';

interface IngestBarProps {
  nodes: Record<string, PortalNode>;
  /** Empty string means "no content typed" — the modal falls back to step 1. */
  onSubmit: (text: string) => void;
  onSyncNode: (id: string) => void;
  onOpenMaintenance: () => void;
}

type ResponsePhase = 'thinking' | 'drift-result' | 'synced' | 'issues-result';

interface Response {
  phase: ResponsePhase;
  drift?: DriftSummary[];
}

const ATTACH_OPTIONS: { label: string; fake: string }[] = [
  { label: 'Upload file', fake: 'press-release.docx' },
  { label: 'Paste link', fake: 'adidas-group.com/press/fifa-2026' },
  { label: 'From CMS draft', fake: 'Newsroom draft' },
];

/** Floating chat-style entry point — handles both ingest AND natural-language commands. */
export function IngestBar({ nodes, onSubmit, onSyncNode, onOpenMaintenance }: IngestBarProps) {
  const [value, setValue] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);

  const hasContent = value.trim().length > 0 || chips.length > 0;

  const addChip = (fake: string) => {
    setChips((c) => [...c, fake]);
    setMenuOpen(false);
  };
  const removeChip = (i: number) => setChips((c) => c.filter((_, idx) => idx !== i));

  const runSyncFigures = () => {
    setResponse({ phase: 'thinking' });
    setTimeout(() => setResponse({ phase: 'drift-result', drift: findDrift(nodes) }), 800);
  };

  const runShowIssues = () => {
    setResponse({ phase: 'thinking' });
    setTimeout(() => {
      onOpenMaintenance();
      setResponse(null);
    }, 500);
  };

  const send = () => {
    const text = value.trim();
    const command = matchCommand(text);
    if (command?.kind === 'sync-figures') {
      runSyncFigures();
    } else if (command?.kind === 'show-issues') {
      runShowIssues();
    } else {
      onSubmit(text);
    }
    setValue('');
    setChips([]);
  };

  const syncAll = () => {
    (response?.drift ?? []).forEach((d) => onSyncNode(d.nodeId));
    setResponse({ phase: 'synced' });
  };

  const reviewInMaintenance = () => {
    onOpenMaintenance();
    setResponse(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', width: '100%', maxWidth: 640, zIndex: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {response && <ResponseCard response={response} onSync={syncAll} onReview={reviewInMaintenance} onDismiss={() => setResponse(null)} />}

      <div
        style={{
          background: '#0b0b0b',
          border: `1px solid ${focused ? TOOL.accent : TOOL.border}`,
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transition: 'border-color 0.15s',
        }}
      >
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '2px 4px 0' }}>
            {chips.map((c, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: TOOL.bg,
                  border: `1px solid ${TOOL.border}`,
                  borderRadius: 100,
                  padding: '4px 8px 4px 10px',
                }}
              >
                <span style={mono({ color: TOOL.content, fontSize: 11 })}>{c}</span>
                <button
                  type="button"
                  onClick={() => removeChip(i)}
                  style={{ background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                >
                  <Close size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen((m) => !m)}
              title="Add content"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'transparent',
                border: `1px solid ${TOOL.border}`,
                color: TOOL.content,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
            </button>
            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: 0,
                  background: TOOL.panel,
                  border: `1px solid ${TOOL.border}`,
                  borderRadius: 10,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 170,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                }}
              >
                {ATTACH_OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => addChip(o.fake)}
                    style={ui({
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: TOOL.content,
                      fontSize: 12.5,
                      padding: '7px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste content to ingest, or ask Portals…"
            rows={1}
            style={ui({
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: TOOL.primary,
              fontSize: 13.5,
              lineHeight: 1.5,
              padding: '6px 2px',
              maxHeight: 120,
            })}
          />

          <button
            type="button"
            onClick={send}
            title="Ingest"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              background: hasContent ? TOOL.accent : 'transparent',
              border: `1px solid ${hasContent ? TOOL.accent : TOOL.border}`,
              color: hasContent ? '#fff' : TOOL.faint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponseCard({
  response, onSync, onReview, onDismiss,
}: {
  response: Response;
  onSync: () => void;
  onReview: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        background: '#0b0b0b',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: '0 16px 44px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: TOOL.accent, display: 'inline-flex' }}>
          {response.phase === 'thinking' ? <Spinner /> : <Sparkle size={13} />}
        </span>
        <span style={ui({ color: TOOL.primary, fontSize: 12.5, fontWeight: 500, flex: 1 })}>
          {response.phase === 'thinking' && 'Checking live sources…'}
          {response.phase === 'drift-result' && (response.drift?.length ? `Found ${response.drift.length} page${response.drift.length === 1 ? '' : 's'} with drifted figures` : 'All figures in sync')}
          {response.phase === 'synced' && 'Updated · synced from live sources'}
        </span>
        {response.phase !== 'thinking' && (
          <button type="button" onClick={onDismiss} style={{ background: 'none', border: 'none', color: TOOL.mute, cursor: 'pointer', display: 'inline-flex' }}>
            <Close size={14} />
          </button>
        )}
      </div>

      {response.phase === 'drift-result' && (response.drift?.length ?? 0) > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {response.drift!.map((d) => (
              <div key={d.nodeId} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={ui({ color: TOOL.primary, fontSize: 12, fontWeight: 500 })}>{d.nodeName}</span>
                <span style={ui({ color: TOOL.content, fontSize: 11.5, lineHeight: 1.4 })}>
                  {d.headline}
                  {d.extraCount > 0 && <span style={{ color: TOOL.faint }}> · +{d.extraCount} more</span>}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onSync} style={cardBtn(true)}>Sync now</button>
            <button type="button" onClick={onReview} style={cardBtn(false)}>Review in Maintenance</button>
          </div>
        </>
      )}

      {response.phase === 'drift-result' && (response.drift?.length ?? 0) === 0 && (
        <span style={{ color: '#3ddc84', fontSize: 16, lineHeight: 1 }}>✓</span>
      )}
    </div>
  );
}

function cardBtn(accent: boolean): React.CSSProperties {
  return ui({
    padding: '7px 14px',
    borderRadius: 100,
    border: `1px solid ${accent ? TOOL.accent : TOOL.border}`,
    background: accent ? TOOL.accent : 'transparent',
    color: accent ? '#fff' : TOOL.content,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  });
}

function Spinner() {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.35)',
        borderTopColor: TOOL.accent,
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
