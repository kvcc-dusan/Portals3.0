/**
 * Portals 3.0 — object model
 *
 * The node graph is the source of truth. A rendered page is a disposable
 * output produced by feeding (node content + theme) into one renderer.
 */

export type NodeType = 'site' | 'page' | 'section' | 'block';

export type ThemeId = 'editorial' | 'technical' | 'index';

/** How a node's current content came to be — drives the human-in-the-loop trust badge. */
export type Provenance = 'ai-generated' | 'human-edited' | 'synced';

export type CorporateContext =
  | 'Company'
  | 'Sustainability'
  | 'Investor Relations'
  | 'Newsroom'
  | 'Brands';

/** Components the renderer composes. A theme decides which, in what order. */
export type ComponentKind =
  | 'hero'
  | 'pull-quote'
  | 'text-block'
  | 'image-grid'
  | 'data-table'
  | 'stat-callout'
  | 'card-grid'
  | 'link-list';

/** A corporate data source the CMS can pull live figures from. */
export interface DataSource {
  id: string;
  name: string; // e.g. "Finance DB"
  kind: string; // e.g. "Financial system"
}

/** A field a source exposes, carrying its CURRENT upstream value. */
export interface SourceField {
  sourceId: string;
  key: string;
  label: string; // e.g. "Net sales (Q3)"
  value: string; // current live value, e.g. "€6.9B"
}

/** A node stat wired to a live source field. */
export interface Binding {
  statIndex: number; // which content.stats entry this drives
  sourceId: string;
  fieldKey: string;
  syncedValue: string; // value at last sync (what the page currently shows)
  syncedAt: string; // human label, e.g. "2 days ago" / "Just now"
}

/**
 * Content fields a node carries. Deliberately a wide bag — the renderer reads
 * whatever the active theme calls for and ignores the rest. This is what makes
 * the same node recompose under a different theme.
 */
export interface NodeContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  lead?: string;
  body?: string[];
  quote?: { text: string; attribution?: string };
  heroImage?: string;
  images?: { src: string; caption?: string }[];
  stats?: { value: string; label: string }[];
  table?: { caption?: string; columns: string[]; rows: string[][] };
  cards?: { title: string; meta?: string; blurb?: string }[];
  links?: { label: string; meta?: string }[];
}

export interface PortalNode {
  id: string;
  type: NodeType;
  name: string;
  context: CorporateContext;
  theme: ThemeId;
  content: NodeContent;
  bindings: Binding[];
  parentId: string | null;
  /** Referential edges — cross-links to related nodes. */
  refs: string[];
  /** Canvas position (graph coordinates). */
  x: number;
  y: number;
  /** Marks nodes that animate in during an ingest flow. */
  proposed?: boolean;
  /** Whether a rendered page already exists. Newly ingested nodes start false. */
  rendered?: boolean;
  /** Provenance of the current content (HITL trust signal). */
  origin?: Provenance;
  /** Human-readable last-updated label, e.g. "3 days ago" / "Just now". */
  updatedAt?: string;
}

/** A maintenance refresh staged for human approval before it goes live. */
export interface PendingRefresh {
  id: string;
  before: NodeContent;
  after: NodeContent;
  /** When 'drift', approval commits via the binding-sync path instead of a plain content swap. */
  kind?: 'drift';
}

export type Surface = 'workspace' | 'maintenance' | 'preview';

/** A selected edge. Structural edges key on their child; references on from→to. */
export type EdgeId = `struct:${string}` | `ref:${string}:${string}`;

export interface AppState {
  nodes: Record<string, PortalNode>;
  rootId: string;
  selectedId: string | null;
  /** Selected edge (mutually exclusive with selectedId). */
  selectedEdgeId: EdgeId | null;
  /** Ids of collapsed parents — their descendants are hidden. */
  collapsed: string[];
  /** Node that just changed via Refresh — drives a one-shot highlight. */
  justRefreshedId: string | null;
  /** One-shot request to recenter the canvas on a node. */
  focusId: string | null;
  surface: Surface;
  /** Node currently rendered in the preview surface. */
  previewId: string | null;
  /** Theme override used while previewing (lets you swap without mutating). */
  previewTheme: ThemeId | null;
  compareMode: boolean;
  ingestOpen: boolean;
  /** Text handed off from the floating IngestBar — seeds the modal past step 1. */
  ingestSeedText: string;
  /** Transient "Generating pages…" state after placing ingested nodes. */
  generatingPages: boolean;
  /** A refresh awaiting human approval (diff shown), or null. */
  pendingRefresh: PendingRefresh | null;
  /** Whether the pending refresh diff should open straight into visual compare mode. */
  pendingRefreshVisual: boolean;
  /** Whether the site has been published since the last edit. */
  published: boolean;
}
