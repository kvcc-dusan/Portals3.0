import type { PortalNode } from '../types';

/**
 * Demo "AI" link suggester. No model call — a transparent heuristic that ranks
 * other nodes by shared corporate context + keyword overlap, so the Inspector's
 * "Suggest links" action produces plausible cross-links for ANY selected node
 * (including freshly ingested ones). Swappable for a real model behind the same
 * signature later.
 */

export interface RefSuggestion {
  to: string;
  reason: string;
}

const STOP = new Set([
  'the', 'and', 'our', 'for', 'with', 'from', 'into', 'across', 'this', 'that',
  'are', 'all', 'official', 'global', 'group', 'new', 'page', 'section',
]);

const keywords = (n: PortalNode): Set<string> => {
  const text = [n.name, n.content.eyebrow, n.content.title, n.content.lead].filter(Boolean).join(' ').toLowerCase();
  return new Set(
    text
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
};

export function suggestReferences(node: PortalNode, nodes: Record<string, PortalNode>, max = 4): RefSuggestion[] {
  // Never suggest self, existing links, ancestors or descendants.
  const exclude = new Set<string>([node.id, ...node.refs]);
  let p = node.parentId;
  while (p) {
    exclude.add(p);
    p = nodes[p]?.parentId ?? null;
  }
  const addDescendants = (id: string) =>
    Object.values(nodes).forEach((n) => {
      if (n.parentId === id && !exclude.has(n.id)) {
        exclude.add(n.id);
        addDescendants(n.id);
      }
    });
  addDescendants(node.id);

  const myWords = keywords(node);

  return Object.values(nodes)
    .filter((n) => !exclude.has(n.id) && n.type !== 'site' && n.type !== 'block')
    .map((n) => {
      const shared = [...myWords].filter((w) => keywords(n).has(w));
      const sameContext = n.context === node.context;
      const score = (sameContext ? 3 : 0) + shared.length * 2;
      return { n, score, sameContext, shared };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ n, sameContext, shared }) => ({ to: n.id, reason: buildReason(sameContext, shared, n) }));
}

function buildReason(sameContext: boolean, shared: string[], target: PortalNode): string {
  if (shared.length) {
    const kw = shared.slice(0, 2).map((w) => `"${w}"`).join(' & ');
    return sameContext ? `Same context, both cover ${kw}.` : `Both cover ${kw}.`;
  }
  if (sameContext) return `Shares the ${target.context} context.`;
  return `Related to ${target.name}.`;
}
