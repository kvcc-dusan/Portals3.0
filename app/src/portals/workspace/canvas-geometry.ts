import type { NodeType, ThemeId } from '../types';

/** Fixed card dimensions per node type — a real size gradient, not a 2px delta. */
export const NODE_SIZE: Record<NodeType, { w: number; h: number }> = {
  site: { w: 232, h: 74 },
  page: { w: 208, h: 60 },
  section: { w: 180, h: 50 },
  block: { w: 150, h: 42 },
};

/** A placed node: laid-out top-left + type (drives width/height). */
type Placed = { x: number; y: number; type: NodeType };

export const anchorRight = (n: Placed) => ({
  x: n.x + NODE_SIZE[n.type].w,
  y: n.y + NODE_SIZE[n.type].h / 2,
});

export const anchorLeft = (n: Placed) => ({
  x: n.x,
  y: n.y + NODE_SIZE[n.type].h / 2,
});

export const center = (n: Placed) => ({
  x: n.x + NODE_SIZE[n.type].w / 2,
  y: n.y + NODE_SIZE[n.type].h / 2,
});

/** Tool-side indicator hue for a theme (not a page color). */
export const THEME_HUE: Record<ThemeId, string> = {
  editorial: '#e0a23c',
  technical: '#5aa9e6',
  index: '#9a9a9a',
};
