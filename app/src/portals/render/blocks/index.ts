import type { ComponentKind } from '../../types';
import type { BlockProps } from './types';
import { Hero } from './Hero';
import { TextBlock } from './TextBlock';
import { PullQuote } from './PullQuote';
import { ImageGrid } from './ImageGrid';
import { DataTable } from './DataTable';
import { StatCallout } from './StatCallout';
import { CardGrid } from './CardGrid';
import { LinkList } from './LinkList';

/** The component library the renderer composes, keyed by component kind. */
export const BLOCKS: Record<ComponentKind, (props: BlockProps) => React.ReactNode> = {
  hero: Hero,
  'text-block': TextBlock,
  'pull-quote': PullQuote,
  'image-grid': ImageGrid,
  'data-table': DataTable,
  'stat-callout': StatCallout,
  'card-grid': CardGrid,
  'link-list': LinkList,
};
