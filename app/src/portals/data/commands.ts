import type { PortalNode } from '../types';
import { driftedBindings } from './health';
import { fieldOf, sourceById } from './sources';

/**
 * Cheap keyword matching for the ingest bar's command mode — no real NLP, just
 * enough to demo "the same input handles authoring AND maintenance".
 */
export type CommandKind = 'sync-figures' | 'show-issues';

export interface CommandIntent {
  kind: CommandKind;
}

const SYNC_RE = /\b(sync|update|refresh|fix)\b/i;
const FIGURE_RE = /\b(figures?|stats?|data|numbers?|sales|revenue|q[1-4]|quarter(ly)?)\b/i;
const ISSUE_RE = /\b(attention|issues?|problems?|health|wrong|broken)\b/i;

export function matchCommand(text: string): CommandIntent | null {
  const t = text.trim();
  if (!t) return null;
  if (SYNC_RE.test(t) && FIGURE_RE.test(t)) return { kind: 'sync-figures' };
  if (ISSUE_RE.test(t)) return { kind: 'show-issues' };
  return null;
}

export interface DriftSummary {
  nodeId: string;
  nodeName: string;
  headline: string;
  extraCount: number;
}

/** One entry per node with at least one drifted binding — reuses the same drift detection as Maintenance. */
export function findDrift(nodes: Record<string, PortalNode>): DriftSummary[] {
  return Object.values(nodes)
    .map((node) => {
      const drifted = driftedBindings(node);
      if (drifted.length === 0) return null;
      const first = drifted[0];
      const field = fieldOf(first.sourceId, first.fieldKey);
      if (!field) return null;
      const sourceName = sourceById(first.sourceId)?.name ?? first.sourceId;
      return {
        nodeId: node.id,
        nodeName: node.name,
        headline: `${field.label}: ${first.syncedValue} → ${field.value} · ${sourceName}`,
        extraCount: drifted.length - 1,
      };
    })
    .filter((x): x is DriftSummary => x !== null);
}
