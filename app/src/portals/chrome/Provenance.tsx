import type { Provenance } from '../types';
import { TOOL, ui, mono } from './tokens';

/** Colour + label per provenance state — the human-in-the-loop trust signal. */
export const PROVENANCE_META: Record<Provenance, { label: string; color: string }> = {
  'ai-generated': { label: 'AI generated', color: TOOL.accent },
  'human-edited': { label: 'Human edited', color: '#6e8bd6' },
  synced: { label: 'Synced from source', color: '#3ddc84' },
};

export function ProvenanceBadge({ origin, updatedAt }: { origin: Provenance; updatedAt?: string }) {
  const meta = PROVENANCE_META[origin];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: `1px solid ${TOOL.border}`,
        borderRadius: 8,
        padding: '7px 10px',
        background: TOOL.bg,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      <span style={ui({ color: TOOL.content, fontSize: 12, fontWeight: 500 })}>{meta.label}</span>
      {updatedAt && <span style={mono({ color: TOOL.faint, fontSize: 10, marginLeft: 'auto' })}>{updatedAt}</span>}
    </div>
  );
}
