import type { NodeContent, PortalNode } from '../types';

/**
 * The pre-loaded adidas-group-style site model. This is the source of truth the
 * tool maintains node-by-node. Layout is a layered tree (site → areas → sections)
 * laid out left-to-right; the canvas is pannable so total height is unbounded.
 */

const img = (seed: string, w = 1600, h = 900, grayscale = true): string =>
  `https://picsum.photos/seed/${seed}/${w}/${h}${grayscale ? '?grayscale' : ''}`;

// ─── Site root ────────────────────────────────────────────────────────────────

const site: PortalNode = {
  id: 'site',
  type: 'site',
  name: 'adidas-group.com',
  context: 'Company',
  theme: 'index',
  parentId: null,
  refs: [],
  bindings: [],
  x: 60,
  y: 892,
  content: {
    eyebrow: 'Corporate',
    title: 'adidas Group',
    lead: 'Through sport, we have the power to change lives.',
  },
};

// ─── Area landing pages (one per corporate context) ─────────────────────────────

const areas: PortalNode[] = [
  {
    id: 'area-company',
    type: 'page',
    name: 'Company',
    context: 'Company',
    theme: 'index',
    parentId: 'site',
    refs: ['sec-ir-results'],
    bindings: [],
    x: 460,
    y: 180,
    content: {
      eyebrow: 'Company',
      title: 'Who We Are',
      lead: 'A global leader in the sporting goods industry, headquartered in Herzogenaurach, Germany.',
      cards: [
        { title: 'Our Strategy', meta: 'Own the Game', blurb: 'The strategic framework guiding us to 2030.' },
        { title: 'Leadership', meta: 'Executive Board', blurb: 'The people steering the company.' },
        { title: 'History', meta: 'Since 1949', blurb: 'From a single workshop to a global brand.' },
      ],
      links: [
        { label: 'Corporate Governance', meta: 'Company' },
        { label: 'Careers', meta: 'People' },
        { label: 'Locations', meta: 'Worldwide' },
      ],
    },
  },
  {
    id: 'area-sustainability',
    type: 'page',
    name: 'Sustainability',
    context: 'Sustainability',
    theme: 'editorial',
    parentId: 'site',
    refs: ['sec-sus-materials', 'sec-ir-results'],
    bindings: [],
    x: 460,
    y: 560,
    content: {
      eyebrow: 'Sustainability',
      title: 'People & Planet',
      lead: 'We are committed to creating a better future for people and the planet through sport.',
      heroImage: img('sustainability-hero'),
      body: [
        'Our sustainability strategy is built on the conviction that there is no business case for the destruction of the planet. We focus on the materials we use, the way we make our products, and the conditions of the people who make them.',
      ],
      cards: [
        { title: 'Carbon Neutrality by 2030', meta: 'Climate', blurb: 'Our roadmap to net-zero across the value chain.' },
        { title: 'Materials & Circularity', meta: 'Product', blurb: 'Ending plastic waste, one product at a time.' },
        { title: 'Supply Chain Standards', meta: 'People', blurb: 'Fair, safe and healthy working conditions.' },
      ],
    },
  },
  {
    id: 'area-ir',
    type: 'page',
    name: 'Investor Relations',
    context: 'Investor Relations',
    theme: 'technical',
    parentId: 'site',
    refs: [],
    bindings: [],
    x: 460,
    y: 940,
    content: {
      eyebrow: 'Investor Relations',
      title: 'Investors',
      lead: 'Financial reporting, the financial calendar and shareholder information.',
      stats: [
        { value: '€23.7B', label: 'Net sales FY24' },
        { value: '+18%', label: 'Currency-neutral growth' },
        { value: '€1.34B', label: 'Operating profit' },
        { value: '178.1M', label: 'Shares outstanding' },
      ],
      links: [
        { label: 'Quarterly Results', meta: 'Reporting' },
        { label: 'Financial Calendar', meta: 'Dates' },
        { label: 'Annual Report 2024', meta: 'PDF · 12.4 MB' },
        { label: 'Share & Bonds', meta: 'ISIN DE000A1EWWW0' },
      ],
    },
  },
  {
    id: 'area-newsroom',
    type: 'page',
    name: 'Newsroom',
    context: 'Newsroom',
    theme: 'index',
    parentId: 'site',
    refs: [],
    bindings: [],
    x: 460,
    y: 1260,
    content: {
      eyebrow: 'Newsroom',
      title: 'Press & Media',
      lead: 'The latest news, press releases and media assets from the adidas Group.',
      cards: [
        { title: 'Latest Press Releases', meta: 'Updated daily', blurb: 'Official company announcements.' },
        { title: 'Media Library', meta: 'Assets', blurb: 'Logos, imagery and brand resources.' },
      ],
    },
  },
  {
    id: 'area-brands',
    type: 'page',
    name: 'Brands',
    context: 'Brands',
    theme: 'index',
    parentId: 'site',
    refs: [],
    bindings: [],
    x: 460,
    y: 1520,
    content: {
      eyebrow: 'Brands',
      title: 'Our Brands',
      lead: 'A portfolio of brands built to serve every athlete.',
      cards: [
        { title: 'adidas Performance', meta: 'Sport', blurb: 'Engineered for the world’s best athletes.' },
        { title: 'adidas Originals', meta: 'Lifestyle', blurb: 'The original since 1972.' },
      ],
    },
  },
];

// ─── Sections (the maintainable leaf surfaces) ──────────────────────────────────

const sections: PortalNode[] = [
  // Company
  sectionNode('sec-co-strategy', 'Our Strategy', 'Company', 'technical', 'area-company', 60, [], [
    { value: '2030', label: 'Strategy horizon' },
    { value: '5', label: 'Strategic priorities' },
  ]),
  sectionNode('sec-co-leadership', 'Leadership', 'Company', 'index', 'area-company', 180),
  sectionNode('sec-co-history', 'History', 'Company', 'editorial', 'area-company', 300),

  // Sustainability — Carbon Neutrality is the fully fleshed Flow C node, defined below
  carbonNeutrality(),
  sectionNode('sec-sus-materials', 'Materials & Circularity', 'Sustainability', 'editorial', 'area-sustainability', 560, ['sec-sus-carbon']),
  sectionNode('sec-sus-supply', 'Supply Chain Standards', 'Sustainability', 'technical', 'area-sustainability', 680),

  // Investor Relations
  q3Results(),
  sectionNode('sec-ir-calendar', 'Financial Calendar', 'Investor Relations', 'index', 'area-ir', 940),
  sectionNode('sec-ir-annual', 'Annual Report', 'Investor Relations', 'editorial', 'area-ir', 1060, ['sec-ir-results']),

  // Newsroom
  sectionNode('sec-news-press', 'Latest Press Releases', 'Newsroom', 'index', 'area-newsroom', 1200),
  sectionNode('sec-news-media', 'Media Library', 'Newsroom', 'index', 'area-newsroom', 1320),

  // Brands
  sectionNode('sec-brand-perf', 'adidas Performance', 'Brands', 'editorial', 'area-brands', 1460),
  sectionNode('sec-brand-orig', 'adidas Originals', 'Brands', 'editorial', 'area-brands', 1580),
];

// ─── Section factories ──────────────────────────────────────────────────────────

function sectionNode(
  id: string,
  name: string,
  context: PortalNode['context'],
  theme: PortalNode['theme'],
  parentId: string,
  y: number,
  refs: string[] = [],
  stats?: { value: string; label: string }[],
): PortalNode {
  return {
    id,
    type: 'section',
    name,
    context,
    theme,
    parentId,
    refs,
    bindings: [],
    x: 900,
    y,
    content: {
      eyebrow: context,
      title: name,
      lead: `${name} — maintained as a single node in the model. Update it here and the published page regenerates.`,
      heroImage: img(id),
      body: [
        'This section is part of the living site model. Its content, corporate context and theme are all editable from the inspector, and the rendered page is produced on demand.',
        'In a real deployment the copy below would be the published content for this section, kept in sync with the rest of the corporate site node-by-node.',
      ],
      stats,
      links: [
        { label: 'Related: Newsroom', meta: 'Cross-link' },
        { label: 'Related: Investor Relations', meta: 'Cross-link' },
      ],
    },
  };
}

// Block-level node — a content block nested inside a section. Gives the
// Sustainability branch real site → page → section → block depth.
function blockNode(
  id: string,
  name: string,
  parentId: string,
  context: PortalNode['context'],
  y: number,
  content: Partial<NodeContent> = {},
): PortalNode {
  return {
    id,
    type: 'block',
    name,
    context,
    theme: 'index',
    parentId,
    refs: [],
    bindings: [],
    x: 1180,
    y,
    content: {
      eyebrow: context,
      title: name,
      lead: `${name} — a content block maintained inside its section.`,
      ...content,
    },
  };
}

// Real block nodes under two Sustainability sections (Carbon Neutrality and
// Materials & Circularity). These are genuine graph entries, not labels.
const blocks: PortalNode[] = [
  // Under Carbon Neutrality by 2030 (sec-sus-carbon, y 440)
  blockNode('blk-carbon-targets', '2030 Targets', 'sec-sus-carbon', 'Sustainability', 372, {
    stats: [
      { value: '−35%', label: 'Absolute emissions by 2030' },
      { value: '2045', label: 'Net-zero value chain' },
    ],
  }),
  blockNode('blk-carbon-scope3', 'Scope 3 Roadmap', 'sec-sus-carbon', 'Sustainability', 428, {
    body: ['The supply-chain decarbonisation roadmap covering materials, manufacturing and logistics — the majority of the footprint.'],
  }),
  blockNode('blk-carbon-renewables', 'Renewable Energy Sourcing', 'sec-sus-carbon', 'Sustainability', 484, {
    body: ['On-site generation and power-purchase agreements bringing own-operations electricity to 100% renewable.'],
  }),
  blockNode('blk-carbon-verification', 'Verification & Audit', 'sec-sus-carbon', 'Sustainability', 540, {
    links: [{ label: 'Science Based Targets initiative', meta: 'External assurance' }],
  }),
  // Under Materials & Circularity (sec-sus-materials, y 560)
  blockNode('blk-mat-recycled', 'Recycled Polyester', 'sec-sus-materials', 'Sustainability', 612, {
    stats: [{ value: '99%', label: 'Recycled polyester by volume' }],
  }),
  blockNode('blk-mat-circular', 'Circular Design', 'sec-sus-materials', 'Sustainability', 668),
  blockNode('blk-mat-endplastic', 'End Plastic Waste', 'sec-sus-materials', 'Sustainability', 724),
];

// One node fully fleshed out to drive Flow C under Editorial AND Technical.
function carbonNeutrality(): PortalNode {
  return {
    id: 'sec-sus-carbon',
    type: 'section',
    name: 'Carbon Neutrality by 2030',
    context: 'Sustainability',
    theme: 'editorial',
    parentId: 'area-sustainability',
    refs: ['sec-sus-materials', 'sec-sus-supply'],
    bindings: [],
    x: 900,
    y: 440,
    content: {
      eyebrow: 'Climate Action',
      title: 'Carbon Neutrality by 2030',
      subtitle: 'Our roadmap to a net-zero value chain',
      lead: 'We have committed to climate neutrality across our own operations by 2025, and net-zero emissions across the entire value chain by 2050 — with a 30% absolute reduction already targeted for 2030.',
      heroImage: img('carbon-hero', 1600, 900),
      body: [
        'Climate change is the defining challenge of our generation, and sport is not immune. Rising temperatures, extreme weather and resource scarcity threaten the places where people play. We believe a company of our scale has both the responsibility and the means to act.',
        'Our approach is grounded in science. We have set targets approved by the Science Based Targets initiative, covering not only our own facilities but the emissions embedded in the materials we buy and the products our partners manufacture — the vast majority of our footprint.',
        'Reaching net-zero is not a single intervention but a portfolio of changes: renewable energy across our sites, recycled and lower-impact materials, cleaner logistics, and deep collaboration with the suppliers who make our products. Progress is measured, audited and reported every year.',
      ],
      quote: {
        text: 'There is no business case for the destruction of the planet. Decarbonisation is not a cost to be managed — it is the foundation of a business built to last.',
        attribution: 'Head of Sustainability, adidas Group',
      },
      images: [
        { src: img('carbon-solar', 800, 600), caption: 'On-site renewable energy at a European distribution centre.' },
        { src: img('carbon-materials', 800, 600), caption: 'Recycled polyester yarn entering the production line.' },
      ],
      stats: [
        { value: '−30%', label: 'Absolute emissions by 2030 vs. 2017' },
        { value: '2025', label: 'Climate-neutral own operations' },
        { value: '2050', label: 'Net-zero across value chain' },
        { value: '96%', label: 'Renewable electricity at own sites' },
      ],
      table: {
        caption: 'Emissions reduction pathway by scope (tCO₂e, indexed to 2017 = 100)',
        columns: ['Scope', 'Source', '2017', '2024', '2030 target'],
        rows: [
          ['Scope 1', 'Direct operations', '100', '61', '40'],
          ['Scope 2', 'Purchased energy', '100', '23', '15'],
          ['Scope 3', 'Supply chain & products', '100', '88', '70'],
          ['Total', 'All scopes', '100', '84', '70'],
        ],
      },
      links: [
        { label: 'Materials & Circularity', meta: 'Related node' },
        { label: 'Supply Chain Standards', meta: 'Related node' },
        { label: 'Science Based Targets commitment', meta: 'External' },
      ],
    },
  };
}

// Investor-relations node with a binding chip and table — sings under Technical.
function q3Results(): PortalNode {
  return {
    id: 'sec-ir-results',
    type: 'section',
    name: 'Q3 2025 Results',
    context: 'Investor Relations',
    theme: 'technical',
    parentId: 'area-ir',
    refs: ['sec-ir-annual'],
    // stat 0 (Net sales) is intentionally stale: Finance DB now reads €6.9B.
    bindings: [
      { statIndex: 0, sourceId: 'finance-db', fieldKey: 'net-sales-q3', syncedValue: '€6.6B', syncedAt: '2 days ago' },
      { statIndex: 2, sourceId: 'sap-bw', fieldKey: 'gross-margin', syncedValue: '51.8%', syncedAt: '2 days ago' },
      { statIndex: 3, sourceId: 'finance-db', fieldKey: 'operating-profit', syncedValue: '€736M', syncedAt: '2 days ago' },
    ],
    x: 900,
    y: 820,
    content: {
      eyebrow: 'Quarterly Reporting',
      title: 'Third Quarter 2025 Results',
      subtitle: 'Currency-neutral revenue up double digits',
      lead: 'The Group delivered another quarter of strong top-line growth, with momentum across all markets and a continued improvement in profitability.',
      stats: [
        { value: '€6.6B', label: 'Net sales' },
        { value: '+12.7%', label: 'Currency-neutral' },
        { value: '51.8%', label: 'Gross margin' },
        { value: '€736M', label: 'Operating profit' },
      ],
      table: {
        caption: 'Net sales by market (€ million, currency-neutral growth)',
        columns: ['Market', 'Q3 2025', 'Q3 2024', 'Growth'],
        rows: [
          ['EMEA', '2,612', '2,301', '+13.5%'],
          ['North America', '1,489', '1,402', '+6.2%'],
          ['Greater China', '1,041', '948', '+9.8%'],
          ['Asia-Pacific', '742', '631', '+17.6%'],
          ['Latin America', '716', '588', '+21.8%'],
        ],
      },
      body: [
        'Operating profit rose to €736 million, lifting the operating margin to 11.1%. The improvement was driven by a higher gross margin, disciplined cost control and lower discounting across the wholesale channel.',
        'Management confirmed its full-year guidance, expecting currency-neutral revenues to grow at a high-single-digit to low-double-digit rate.',
      ],
      links: [
        { label: 'Q3 2025 Press Release', meta: 'PDF' },
        { label: 'Analyst Call Replay', meta: 'Webcast' },
        { label: 'Financial Calendar', meta: 'Investor Relations' },
      ],
    },
  };
}

// ─── Assembled graph ────────────────────────────────────────────────────────────

// Seed provenance so the graph looks lived-in: most content is human-maintained,
// a few nodes were last synced from a source, one area was AI-drafted.
const SEED_PROVENANCE: Record<string, { origin: PortalNode['origin']; updatedAt: string }> = {
  // Fresh / recently touched
  'sec-sus-carbon': { origin: 'human-edited', updatedAt: '3 days ago' },
  'sec-ir-results': { origin: 'synced', updatedAt: '1 day ago' }, // drift lives here (binding)
  'sec-news-press': { origin: 'synced', updatedAt: '6 hours ago' },
  // Needs review (AI-generated, no human pass)
  'area-newsroom': { origin: 'ai-generated', updatedAt: '5 days ago' },
  'sec-news-media': { origin: 'ai-generated', updatedAt: '2 days ago' },
  // Stale (old) — a couple also unreviewed
  'sec-co-history': { origin: 'human-edited', updatedAt: '3 months ago' },
  'sec-co-leadership': { origin: 'human-edited', updatedAt: '6 weeks ago' },
  'sec-ir-annual': { origin: 'human-edited', updatedAt: '5 weeks ago' },
  'sec-brand-orig': { origin: 'ai-generated', updatedAt: '2 months ago' },
};

export const INITIAL_NODES: Record<string, PortalNode> = Object.fromEntries(
  [site, ...areas, ...sections, ...blocks].map((n) => {
    // Default: recently maintained (under the staleness threshold) so the graph
    // reads mostly healthy, with the seeded exceptions above needing attention.
    const prov = SEED_PROVENANCE[n.id] ?? { origin: 'human-edited' as const, updatedAt: '9 days ago' };
    return [n.id, { ...n, rendered: true, origin: prov.origin, updatedAt: prov.updatedAt }];
  }),
);

export const ROOT_ID = 'site';

// ─── Maintenance refresh (Flow A) ───────────────────────────────────────────────
// Authored "newer" content a section refreshes to. Carbon Neutrality has a full
// before/after pair; any other node gets a light generic refresh so the action
// always visibly does something.

const CARBON_REFRESHED: NodeContent = {
  eyebrow: 'Climate Action',
  title: 'Carbon Neutrality by 2030',
  subtitle: 'Updated roadmap — net-zero accelerated to 2045',
  lead: 'Following our FY25 review, we have accelerated our net-zero commitment from 2050 to 2045 and tightened our 2030 target to a 35% absolute reduction. Own operations reached climate neutrality in 2025, a year ahead of plan.',
  heroImage: img('carbon-hero', 1600, 900),
  body: [
    'This is an accelerated plan. Faster-than-expected progress on renewable energy and recycled materials has let us bring our value-chain net-zero date forward by five years, with interim milestones independently verified.',
    'Climate change is the defining challenge of our generation, and sport is not immune. Rising temperatures, extreme weather and resource scarcity threaten the places where people play. A company of our scale has both the responsibility and the means to act.',
    'Reaching net-zero is a portfolio of changes: renewable energy across our sites, recycled and lower-impact materials, cleaner logistics, and deep collaboration with the suppliers who make our products. Progress is measured, audited and reported every year.',
  ],
  quote: {
    text: 'Bringing our net-zero date forward to 2045 is not a slogan — it is what the verified data now allows. Decarbonisation is the foundation of a business built to last.',
    attribution: 'Head of Sustainability, adidas Group',
  },
  images: [
    { src: img('carbon-solar', 800, 600), caption: 'On-site renewable energy now powers 100% of our own facilities.' },
    { src: img('carbon-materials', 800, 600), caption: 'Recycled polyester yarn entering the production line.' },
  ],
  stats: [
    { value: '−35%', label: 'Absolute emissions by 2030 vs. 2017' },
    { value: '2025', label: 'Climate-neutral own operations (achieved)' },
    { value: '2045', label: 'Net-zero across value chain' },
    { value: '100%', label: 'Renewable electricity at own sites' },
  ],
  table: {
    caption: 'Emissions reduction pathway by scope (tCO₂e, indexed to 2017 = 100) — FY25 update',
    columns: ['Scope', 'Source', '2017', '2025', '2030 target'],
    rows: [
      ['Scope 1', 'Direct operations', '100', '54', '35'],
      ['Scope 2', 'Purchased energy', '100', '18', '10'],
      ['Scope 3', 'Supply chain & products', '100', '83', '65'],
      ['Total', 'All scopes', '100', '79', '65'],
    ],
  },
  links: [
    { label: 'Materials & Circularity', meta: 'Related node' },
    { label: 'Supply Chain Standards', meta: 'Related node' },
    { label: 'Science Based Targets commitment', meta: 'External' },
  ],
};

const REFRESH_CONTENT: Record<string, NodeContent> = {
  'sec-sus-carbon': CARBON_REFRESHED,
};

export function getRefreshedContent(node: PortalNode): NodeContent {
  const authored = REFRESH_CONTENT[node.id];
  if (authored) return authored;
  const note = 'Reviewed and refreshed in the latest FY25 content pass.';
  return {
    ...node.content,
    lead: node.content.lead ? `${node.content.lead} ${note}` : note,
  };
}

// ─── Flow B — Ingest ────────────────────────────────────────────────────────────

export const INGEST_RAW_TEXT = `adidas and FIFA today announced a multi-year partnership extension making the company the Official Ball Supplier and Official Licensed Products partner through the 2026 and 2030 FIFA World Cup tournaments.

The agreement covers the supply of official match balls, referee equipment and a global range of replica and lifestyle products. As part of the partnership, adidas will launch a dedicated sustainability programme for the 2026 tournament, with all official match balls to incorporate bio-based and recycled materials.

A grassroots component will see investment in youth football facilities across host cities in North America, expanding access to the game for underserved communities.`;

/** Where the ingested branch attaches in the existing graph. */
export const INGEST_PARENT_NAME = 'Newsroom';

/**
 * Pre-written structure the "Generate structure" button proposes for the raw
 * text above: one new page node and three section children. They attach under
 * the existing Newsroom area (see INGEST_PARENT_NAME) and connect to it with a
 * structural edge once placed.
 */
export const INGEST_PROPOSED: PortalNode[] = [
  {
    id: 'proposed-page',
    type: 'page',
    name: 'FIFA World Cup Partnership',
    context: 'Newsroom',
    theme: 'editorial',
    parentId: 'area-newsroom',
    refs: [],
    bindings: [],
    proposed: true,
    rendered: false,
    x: 820,
    y: 1740,
    content: {
      eyebrow: 'Partnership',
      title: 'adidas × FIFA World Cup 2026 & 2030',
      lead: 'A multi-year partnership extension as Official Ball Supplier through the 2026 and 2030 FIFA World Cup tournaments.',
      heroImage: img('fifa-hero'),
    },
  },
  {
    id: 'proposed-sec-1',
    type: 'section',
    name: 'Partnership Scope',
    context: 'Newsroom',
    theme: 'index',
    parentId: 'proposed-page',
    refs: [],
    bindings: [],
    proposed: true,
    rendered: false,
    x: 1180,
    y: 1660,
    content: {
      eyebrow: 'Scope',
      title: 'Official Ball & Licensed Products',
      lead: 'Supply of official match balls, referee equipment and a global range of replica and lifestyle products.',
    },
  },
  {
    id: 'proposed-sec-2',
    type: 'section',
    name: 'Sustainability Programme',
    context: 'Sustainability',
    theme: 'editorial',
    parentId: 'proposed-page',
    refs: [],
    bindings: [],
    proposed: true,
    rendered: false,
    x: 1180,
    y: 1748,
    content: {
      eyebrow: 'Sustainability',
      title: 'Bio-based & Recycled Match Balls',
      lead: 'A dedicated sustainability programme for 2026, with all official match balls incorporating bio-based and recycled materials.',
    },
  },
  {
    id: 'proposed-sec-3',
    type: 'section',
    name: 'Grassroots Investment',
    context: 'Newsroom',
    theme: 'index',
    parentId: 'proposed-page',
    refs: [],
    bindings: [],
    proposed: true,
    rendered: false,
    x: 1180,
    y: 1836,
    content: {
      eyebrow: 'Community',
      title: 'Youth Football Facilities',
      lead: 'Investment in youth football facilities across host cities in North America, expanding access to the game.',
    },
  },
];

/**
 * Cross-links the AI proposes between the ingested branch and EXISTING site
 * nodes — the "Connect" step (Flow B, step 3). `from` is a proposed node id,
 * `to` an existing graph node id. The curator keeps or drops each; accepted
 * ones become reference edges (PortalNode.refs) when the branch is placed.
 */
export interface ConnectionSuggestion {
  from: string;
  to: string;
  reason: string;
}

export const INGEST_CONNECTIONS: ConnectionSuggestion[] = [
  { from: 'proposed-page', to: 'sec-news-press', reason: 'The announcement belongs in the live press feed.' },
  { from: 'proposed-page', to: 'sec-brand-perf', reason: 'The official match ball is an adidas Performance product.' },
  { from: 'proposed-sec-1', to: 'area-brands', reason: 'Licensed & replica products span the brand portfolio.' },
  { from: 'proposed-sec-2', to: 'sec-sus-carbon', reason: 'Shares the carbon-neutral materials programme.' },
  { from: 'proposed-sec-2', to: 'sec-sus-materials', reason: 'Bio-based & recycled materials map to circularity work.' },
  { from: 'proposed-sec-3', to: 'sec-co-strategy', reason: 'Grassroots access ladders into the 2030 strategy.' },
];
