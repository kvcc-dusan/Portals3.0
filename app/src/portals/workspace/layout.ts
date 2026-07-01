import type { PortalNode } from '../types';
import { NODE_SIZE } from './canvas-geometry';

/**
 * Tidy left-to-right tree layout. Positions are DERIVED from the graph structure
 * (not authored x/y), so the tree stays tidy, absorbs ingested nodes, and scales.
 * The stored `y` on each node is used only to preserve authored sibling order.
 */

const COL_PITCH = 320; // horizontal distance between depth columns
const V_GAP = 24; // vertical gap between sibling subtrees
const ROOT_GAP = 60; // extra gap between separate roots

export type Positions = Map<string, { x: number; y: number }>;

export function computeLayout(nodes: Record<string, PortalNode>, collapsed: string[]): Positions {
  const collapsedSet = new Set(collapsed);
  const all = Object.values(nodes);
  const childrenOf = (id: string) => all.filter((n) => n.parentId === id).sort((a, b) => a.y - b.y);
  const roots = all.filter((n) => !n.parentId || !nodes[n.parentId]).sort((a, b) => a.y - b.y);

  const pos: Positions = new Map();
  const seen = new Set<string>();
  let cursor = 0;

  // Returns the vertical CENTER of the placed node's subtree.
  const place = (node: PortalNode, depth: number): number => {
    if (seen.has(node.id)) return cursor; // cycle guard
    seen.add(node.id);
    const { h } = NODE_SIZE[node.type];
    const x = depth * COL_PITCH;
    const kids = collapsedSet.has(node.id) ? [] : childrenOf(node.id);

    if (kids.length === 0) {
      const top = cursor;
      pos.set(node.id, { x, y: top });
      cursor += h + V_GAP;
      return top + h / 2;
    }

    const centers = kids.map((k) => place(k, depth + 1));
    const cy = (centers[0] + centers[centers.length - 1]) / 2;
    pos.set(node.id, { x, y: cy - h / 2 });
    return cy;
  };

  roots.forEach((r, i) => {
    if (i > 0) cursor += ROOT_GAP;
    place(r, 0);
  });

  return pos;
}
