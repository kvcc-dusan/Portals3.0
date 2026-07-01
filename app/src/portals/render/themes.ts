import type { ComponentKind, NodeContent, ThemeId } from '../types';

/**
 * A theme is a COMPOSITION GRAMMAR, not a color skin. Same content and the same
 * component library; what changes is WHICH components are chosen and in what
 * ORDER they sequence. Each theme declares a preferred component order; the
 * renderer keeps only the components the node actually has content for.
 */

const SEQUENCES: Record<ThemeId, ComponentKind[]> = {
  // Long-form story: prose-forward, single column, imagery and quotes lead.
  editorial: ['hero', 'text-block', 'pull-quote', 'image-grid', 'stat-callout', 'data-table', 'card-grid', 'link-list'],
  // Data-forward: stats and tables up top, dense multi-column prose, tight imagery.
  technical: ['hero', 'stat-callout', 'data-table', 'text-block', 'pull-quote', 'image-grid', 'card-grid', 'link-list'],
  // Landing page: cards and links, minimal prose.
  index: ['hero', 'card-grid', 'stat-callout', 'image-grid', 'link-list'],
};

const hasContent = (kind: ComponentKind, c: NodeContent): boolean => {
  switch (kind) {
    case 'hero':
      return !!(c.title || c.eyebrow || c.lead || c.heroImage);
    case 'text-block':
      return !!c.body?.length;
    case 'pull-quote':
      return !!c.quote;
    case 'image-grid':
      return !!c.images?.length;
    case 'data-table':
      return !!c.table;
    case 'stat-callout':
      return !!c.stats?.length;
    case 'card-grid':
      return !!c.cards?.length;
    case 'link-list':
      return !!c.links?.length;
  }
};

/** Resolve a theme + content into the ordered list of components to render. */
export const composeTheme = (theme: ThemeId, content: NodeContent): ComponentKind[] =>
  SEQUENCES[theme].filter((kind) => hasContent(kind, content));

export const THEME_META: Record<ThemeId, { label: string; note: string }> = {
  editorial: { label: 'Editorial', note: 'Large hero · long-form prose · full-bleed imagery' },
  technical: { label: 'Technical', note: 'Dense grid · data tables · stat callouts' },
  index: { label: 'Index', note: 'Card grids · link lists · minimal prose' },
};
