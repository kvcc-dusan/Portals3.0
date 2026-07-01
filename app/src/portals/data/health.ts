import type { PortalNode } from '../types';
import { fieldOf, sourceById } from './sources';

/**
 * Node health for the Maintenance surface. Every signal is DERIVED from real
 * node data — drift from live source values, review from provenance, staleness
 * from the update age — so acting on an issue actually clears it.
 */

export type HealthIssue = 'drift' | 'review' | 'stale' | 'draft';

export const HEALTH_META: Record<HealthIssue, { label: string; short: string; color: string; action: string }> = {
  drift: { label: 'Data drifted', short: 'Drift', color: '#e0673c', action: 'Sync' },
  review: { label: 'Needs review', short: 'Review', color: '#c58af0', action: 'Review' },
  stale: { label: 'Stale content', short: 'Stale', color: '#e0a23c', action: 'Refresh' },
  draft: { label: 'Draft page', short: 'Draft', color: '#7b8290', action: 'Generate' },
};

export const HEALTHY_COLOR = '#3ddc84';

const SEVERITY: Record<HealthIssue, number> = { drift: 4, review: 3, stale: 2, draft: 1 };
const STALE_DAYS = 21;

/** Parse a human "updated" label into days for thresholding/sorting. */
export function ageDays(updatedAt?: string): number {
  if (!updatedAt) return 999;
  const s = updatedAt.toLowerCase();
  if (s.includes('just')) return 0;
  const n = parseInt(s, 10) || 0;
  if (s.includes('hour') || s.includes('min')) return n / 24;
  if (s.includes('day')) return n;
  if (s.includes('week')) return n * 7;
  if (s.includes('month')) return n * 30;
  if (s.includes('year')) return n * 365;
  return 999;
}

/** Bindings whose upstream source value has moved past the last synced value. */
export function driftedBindings(node: PortalNode) {
  return (node.bindings ?? []).filter((b) => {
    const f = fieldOf(b.sourceId, b.fieldKey);
    return f !== undefined && f.value !== b.syncedValue;
  });
}

export interface NodeHealth {
  id: string;
  issues: HealthIssue[];
  top: HealthIssue | null;
  severity: number;
}

export function nodeHealth(node: PortalNode): NodeHealth {
  const issues: HealthIssue[] = [];
  if (driftedBindings(node).length > 0) issues.push('drift');
  if (node.origin === 'ai-generated') issues.push('review');
  if (ageDays(node.updatedAt) > STALE_DAYS) issues.push('stale');
  if (node.rendered === false || node.proposed) issues.push('draft');
  issues.sort((a, b) => SEVERITY[b] - SEVERITY[a]);
  return { id: node.id, issues, top: issues[0] ?? null, severity: issues[0] ? SEVERITY[issues[0]] : 0 };
}

export function computeHealth(nodes: Record<string, PortalNode>): Map<string, NodeHealth> {
  const map = new Map<string, NodeHealth>();
  Object.values(nodes).forEach((n) => map.set(n.id, nodeHealth(n)));
  return map;
}

/** A concrete, human-readable reason a node has a given issue. */
export function issueReason(node: PortalNode, issue: HealthIssue): string {
  switch (issue) {
    case 'drift': {
      const drifted = driftedBindings(node);
      const first = drifted[0];
      const field = first && fieldOf(first.sourceId, first.fieldKey);
      if (!first || !field) return 'Bound data has changed upstream';
      const src = sourceById(first.sourceId)?.name ?? 'source';
      const more = drifted.length > 1 ? ` · +${drifted.length - 1} more` : '';
      return `${field.label}: ${first.syncedValue} → ${field.value} · ${src}${more}`;
    }
    case 'review':
      return 'AI-generated — not yet reviewed by a human';
    case 'stale':
      return `Last updated ${node.updatedAt ?? 'a while ago'}`;
    case 'draft':
      return 'Page not generated yet';
  }
}

/** Nodes that need attention, most severe first. */
export function attentionList(nodes: Record<string, PortalNode>): { node: PortalNode; health: NodeHealth }[] {
  return Object.values(nodes)
    .map((node) => ({ node, health: nodeHealth(node) }))
    .filter((x) => x.health.issues.length > 0)
    .sort((a, b) => b.health.severity - a.health.severity || ageDays(b.node.updatedAt) - ageDays(a.node.updatedAt));
}
