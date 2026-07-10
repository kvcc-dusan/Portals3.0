import { useState } from 'react';
import type { AppState, CorporateContext, EdgeId, PortalNode, Surface, ThemeId } from './types';
import { INITIAL_NODES, ROOT_ID, getRefreshedContent } from './data/graph';
import { fieldOf } from './data/sources';
import { syncedContent } from './data/health';
import { TopNav } from './chrome/TopNav';
import { Toolbar } from './chrome/Toolbar';
import { Canvas } from './workspace/Canvas';
import { Inspector } from './workspace/Inspector';
import { Preview } from './preview/Preview';
import { IngestModal } from './ingest/IngestModal';
import { IngestBar } from './ingest/IngestBar';
import { Maintenance } from './maintenance/Maintenance';
import { RefreshDiffModal } from './workspace/RefreshDiffModal';
import { TOOL } from './chrome/tokens';

const INITIAL_STATE: AppState = {
  nodes: INITIAL_NODES,
  rootId: ROOT_ID,
  selectedId: 'sec-sus-carbon', // land ready for the maintenance + theme-grammar demos
  selectedEdgeId: null,
  collapsed: [],
  justRefreshedId: null,
  focusId: null,
  surface: 'workspace',
  previewId: null,
  previewTheme: null,
  compareMode: false,
  ingestOpen: false,
  ingestSeedText: '',
  generatingPages: false,
  pendingRefresh: null,
  pendingRefreshVisual: false,
  published: false,
};

export function Portals() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const patch = (next: Partial<AppState>) => setState((s) => ({ ...s, ...next }));

  const updateNode = (id: string, change: Partial<PortalNode>) =>
    setState((s) => ({ ...s, nodes: { ...s.nodes, [id]: { ...s.nodes[id], ...change } }, published: false }));

  // ── Selection ─────────────────────────────────────────────────
  const selectNode = (id: string | null) => patch({ selectedId: id, selectedEdgeId: null });
  const selectEdge = (id: EdgeId | null) =>
    setState((s) => ({ ...s, selectedEdgeId: id, selectedId: id ? null : s.selectedId }));

  // ── Node editing ──────────────────────────────────────────────
  const rename = (id: string, name: string) => updateNode(id, { name });
  const setContext = (id: string, context: CorporateContext) => updateNode(id, { context });
  const setTheme = (id: string, theme: ThemeId) => updateNode(id, { theme });
  const reparent = (id: string, parentId: string) => updateNode(id, { parentId });

  // Human content correction (D1) — any edit marks the node human-edited.
  const editContent = (id: string, change: Partial<PortalNode['content']>) =>
    setState((s) => {
      const node = s.nodes[id];
      if (!node) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, content: { ...node.content, ...change }, origin: 'human-edited', updatedAt: 'Just now' } }, published: false };
    });
  const toggleCollapse = (id: string) =>
    setState((s) => ({
      ...s,
      collapsed: s.collapsed.includes(id) ? s.collapsed.filter((c) => c !== id) : [...s.collapsed, id],
    }));

  // ── Node lifecycle (toolbar) ───────────────────────────────────
  const addNode = () => {
    const parentId = state.selectedId ?? state.rootId;
    const parent = state.nodes[parentId];
    if (!parent) return;
    const id = `node-${Date.now()}`;
    const newNode: PortalNode = {
      id,
      type: 'section',
      name: 'New section',
      context: parent.context,
      theme: parent.theme,
      parentId,
      refs: [],
      bindings: [],
      x: parent.x + 240,
      y: parent.y,
      content: { eyebrow: parent.context, title: 'New section', lead: 'Describe this section…' },
      rendered: false,
      origin: 'human-edited',
      updatedAt: 'Just now',
    };
    setState((s) => ({ ...s, nodes: { ...s.nodes, [id]: newNode }, selectedId: id, selectedEdgeId: null, published: false }));
  };

  const deleteNode = () => {
    const id = state.selectedId;
    if (!id || id === state.rootId) return;
    setState((s) => {
      const target = s.nodes[id];
      if (!target) return s;
      const nodes = { ...s.nodes };
      delete nodes[id];
      // Lift orphaned children to the deleted node's parent, and strip dangling refs.
      Object.values(nodes).forEach((n) => {
        if (n.parentId === id) nodes[n.id] = { ...n, parentId: target.parentId };
        if (n.refs.includes(id)) nodes[n.id] = { ...nodes[n.id], refs: nodes[n.id].refs.filter((r) => r !== id) };
      });
      return { ...s, nodes, selectedId: target.parentId, selectedEdgeId: null, published: false };
    });
  };

  // ── Edge editing (HITL link oversight) ────────────────────────
  const deleteEdge = (edgeId: EdgeId) => {
    if (edgeId.startsWith('struct:')) {
      const childId = edgeId.slice('struct:'.length);
      updateNode(childId, { parentId: null });
    } else {
      const [from, to] = edgeId.slice('ref:'.length).split(':');
      setState((s) => ({ ...s, nodes: { ...s.nodes, [from]: { ...s.nodes[from], refs: s.nodes[from].refs.filter((r) => r !== to) } } }));
    }
    patch({ selectedEdgeId: null });
  };
  const addReference = (from: string, to: string) =>
    setState((s) => {
      const src = s.nodes[from];
      if (!src || from === to || src.refs.includes(to)) return s;
      return { ...s, nodes: { ...s.nodes, [from]: { ...src, refs: [...src.refs, to] } } };
    });

  // ── Maintenance refresh (Flow A) — stage a diff, commit on approval ──
  const refresh = (id: string, visual = false) =>
    setState((s) => {
      const node = s.nodes[id];
      if (!node) return s;
      return { ...s, pendingRefresh: { id, before: node.content, after: getRefreshedContent(node) }, pendingRefreshVisual: visual };
    });

  // Stage a drift resolution as a diff for visual review before committing.
  const previewDrift = (id: string) =>
    setState((s) => {
      const node = s.nodes[id];
      if (!node) return s;
      return { ...s, pendingRefresh: { id, before: node.content, after: syncedContent(node), kind: 'drift' }, pendingRefreshVisual: true };
    });

  const approveRefresh = () => {
    const pr = state.pendingRefresh;
    if (!pr) return;
    const pid = pr.id;
    if (pr.kind === 'drift') {
      syncNode(pid);
      patch({ pendingRefresh: null, pendingRefreshVisual: false, justRefreshedId: pid });
    } else {
      setState((s) => {
        const cur = s.pendingRefresh;
        if (!cur || !s.nodes[cur.id]) return s;
        return {
          ...s,
          nodes: { ...s.nodes, [cur.id]: { ...s.nodes[cur.id], content: cur.after, origin: 'synced', updatedAt: 'Just now' } },
          pendingRefresh: null,
          pendingRefreshVisual: false,
          justRefreshedId: cur.id,
          published: false,
        };
      });
    }
    setTimeout(() => setState((s) => (s.justRefreshedId === pid ? { ...s, justRefreshedId: null } : s)), 1400);
  };

  const rejectRefresh = () => patch({ pendingRefresh: null, pendingRefreshVisual: false });

  // ── Live data bindings (Flow C) ───────────────────────────────
  // All three set origin → 'synced' since the figure now mirrors a source.
  const writeStat = (node: PortalNode, statIndex: number, value: string): PortalNode['content'] => ({
    ...node.content,
    stats: (node.content.stats ?? []).map((st, i) => (i === statIndex ? { ...st, value } : st)),
  });

  const bindStat = (nodeId: string, statIndex: number, sourceId: string, fieldKey: string) =>
    setState((s) => {
      const node = s.nodes[nodeId];
      const field = fieldOf(sourceId, fieldKey);
      if (!node || !field) return s;
      const bindings = [
        ...node.bindings.filter((b) => b.statIndex !== statIndex),
        { statIndex, sourceId, fieldKey, syncedValue: field.value, syncedAt: 'Just now' },
      ];
      return { ...s, nodes: { ...s.nodes, [nodeId]: { ...node, content: writeStat(node, statIndex, field.value), bindings, origin: 'synced', updatedAt: 'Just now' } } };
    });

  const syncBinding = (nodeId: string, statIndex: number) =>
    setState((s) => {
      const node = s.nodes[nodeId];
      const binding = node?.bindings.find((b) => b.statIndex === statIndex);
      const field = binding && fieldOf(binding.sourceId, binding.fieldKey);
      if (!node || !binding || !field) return s;
      const bindings = node.bindings.map((b) => (b.statIndex === statIndex ? { ...b, syncedValue: field.value, syncedAt: 'Just now' } : b));
      return { ...s, nodes: { ...s.nodes, [nodeId]: { ...node, content: writeStat(node, statIndex, field.value), bindings, origin: 'synced', updatedAt: 'Just now' } } };
    });

  const unbindStat = (nodeId: string, statIndex: number) =>
    setState((s) => {
      const node = s.nodes[nodeId];
      if (!node) return s;
      return { ...s, nodes: { ...s.nodes, [nodeId]: { ...node, bindings: node.bindings.filter((b) => b.statIndex !== statIndex) } } };
    });

  // ── Maintenance actions ───────────────────────────────────────
  // Sync every drifted binding on a node in one go (resolves a "drift" issue).
  const syncNode = (id: string) =>
    setState((s) => {
      const node = s.nodes[id];
      if (!node) return s;
      let content = node.content;
      let changed = false;
      const bindings = node.bindings.map((b) => {
        const field = fieldOf(b.sourceId, b.fieldKey);
        if (field && field.value !== b.syncedValue) {
          content = writeStat({ ...node, content }, b.statIndex, field.value);
          changed = true;
          return { ...b, syncedValue: field.value, syncedAt: 'Just now' };
        }
        return b;
      });
      if (!changed) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, content, bindings, origin: 'synced', updatedAt: 'Just now' } }, published: false };
    });

  // Human signs off on AI-generated content (resolves a "review" issue).
  const markReviewed = (id: string) => updateNode(id, { origin: 'human-edited', updatedAt: 'Just now' });

  // ── Generate page (Flow B → render) ───────────────────────────
  const generatePage = (id: string) => {
    updateNode(id, { rendered: true });
    openPreview(id);
  };

  // ── Preview ───────────────────────────────────────────────────
  const openPreview = (id: string | null, compare = false) => {
    const target = id ?? state.selectedId ?? state.rootId;
    patch({ surface: 'preview', previewId: target, previewTheme: null, compareMode: compare });
  };

  const switchSurface = (surface: Surface) => {
    if (surface === 'preview') openPreview(state.previewId ?? state.selectedId ?? state.rootId);
    else patch({ surface });
  };

  // ── Ingest / authoring (Flow B) ───────────────────────────────
  // Place the (possibly edited) proposed nodes, then AUTO-generate their pages
  // and open the primary one in Preview — no per-node "Generate" click.
  const placeProposed = (proposed: PortalNode[]) => {
    if (proposed.length === 0) {
      patch({ ingestOpen: false, ingestSeedText: '' });
      return;
    }
    const ids = proposed.map((n) => n.id);
    const primary = proposed.find((n) => !ids.includes(n.parentId ?? ''))?.id ?? proposed[0].id;

    // Step 1: nodes land on the canvas un-rendered, "Generating pages…" runs.
    setState((s) => {
      const added = Object.fromEntries(
        proposed.map((n) => [n.id, { ...n, rendered: false, origin: 'ai-generated' as const, updatedAt: 'Just now' }]),
      );
      return { ...s, nodes: { ...s.nodes, ...added }, ingestOpen: false, ingestSeedText: '', selectedId: primary, selectedEdgeId: null, focusId: primary, generatingPages: true };
    });

    // Step 2: ~1.3s later every new node is rendered and Preview opens on the primary.
    setTimeout(() => {
      setState((s) => {
        const nodes = { ...s.nodes };
        ids.forEach((id) => { if (nodes[id]) nodes[id] = { ...nodes[id], rendered: true }; });
        return { ...s, nodes, generatingPages: false, surface: 'preview', previewId: primary, previewTheme: null, compareMode: false };
      });
    }, 1300);
  };

  const previewNode = state.previewId ? state.nodes[state.previewId] : null;
  const selectedNode = state.selectedId ? state.nodes[state.selectedId] : null;
  const effectiveTheme: ThemeId = previewNode ? state.previewTheme ?? previewNode.theme : 'editorial';
  const breadcrumb = selectedNode?.name ?? state.nodes[state.rootId].name;
  const pageCount = Object.values(state.nodes).filter((n) => n.rendered !== false && n.type !== 'site').length;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: TOOL.bg, display: 'flex', flexDirection: 'column' }}>
      <TopNav surface={state.surface} onSurface={switchSurface} published={state.published} />

      {state.surface === 'workspace' && (
        <>
          <Toolbar
            breadcrumb={breadcrumb}
            canPreview={!!state.selectedId}
            canDelete={!!state.selectedId && state.selectedId !== state.rootId}
            published={state.published}
            pageCount={pageCount}
            onPreview={() => openPreview(state.selectedId)}
            onAddNode={addNode}
            onDeleteNode={deleteNode}
            onPublish={() => patch({ published: true })}
          />
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <div style={{ position: 'absolute', inset: 0, right: selectedNode ? 320 : 0 }}>
              <Canvas
                nodes={state.nodes}
                selectedId={state.selectedId}
                selectedEdgeId={state.selectedEdgeId}
                collapsed={state.collapsed}
                justRefreshedId={state.justRefreshedId}
                focusId={state.focusId}
                onSelect={selectNode}
                onSelectEdge={selectEdge}
                onDeleteEdge={deleteEdge}
                onAddReference={addReference}
                onToggleCollapse={toggleCollapse}
              />
              <IngestBar
                nodes={state.nodes}
                onSubmit={(seedText) => patch({ ingestOpen: true, ingestSeedText: seedText })}
                onSyncNode={syncNode}
                onOpenMaintenance={() => patch({ surface: 'maintenance' })}
              />
            </div>
            {selectedNode && (
              <Inspector
                node={selectedNode}
                nodes={state.nodes}
                onRename={rename}
                onContext={setContext}
                onTheme={setTheme}
                onReparent={reparent}
                onEditContent={editContent}
                onPreview={() => openPreview(state.selectedId)}
                onCompare={() => openPreview(state.selectedId, true)}
                onRefresh={refresh}
                onGenerate={generatePage}
                onAddRef={addReference}
                onBindStat={bindStat}
                onSyncBinding={syncBinding}
                onUnbindStat={unbindStat}
              />
            )}
          </div>
        </>
      )}

      {state.surface === 'maintenance' && (
        <Maintenance
          nodes={state.nodes}
          selectedId={state.selectedId}
          collapsed={state.collapsed}
          focusId={state.focusId}
          onSelect={selectNode}
          onToggleCollapse={toggleCollapse}
          onFocusNode={(id) => patch({ selectedId: id, selectedEdgeId: null, focusId: id })}
          onSync={syncNode}
          onReview={markReviewed}
          onRefresh={refresh}
          onGenerate={generatePage}
          onPreviewDiff={(id, top) => (top === 'drift' ? previewDrift(id) : refresh(id, true))}
        />
      )}

      {state.surface === 'preview' && previewNode && (
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <Preview
            node={previewNode}
            nodes={state.nodes}
            theme={effectiveTheme}
            compare={state.compareMode}
            onTheme={(t) => patch({ previewTheme: t })}
            onToggleCompare={() => patch({ compareMode: !state.compareMode })}
            onExit={() => patch({ surface: 'workspace' })}
            onRefresh={refresh}
            onEditContent={editContent}
          />
        </div>
      )}

      {state.ingestOpen && (
        <IngestModal
          initialText={state.ingestSeedText}
          onClose={() => patch({ ingestOpen: false, ingestSeedText: '' })}
          onPlace={placeProposed}
        />
      )}

      {state.pendingRefresh && state.nodes[state.pendingRefresh.id] && (
        <RefreshDiffModal
          node={state.nodes[state.pendingRefresh.id]}
          before={state.pendingRefresh.before}
          after={state.pendingRefresh.after}
          startVisual={state.pendingRefreshVisual}
          onApprove={approveRefresh}
          onReject={rejectRefresh}
        />
      )}

      {state.generatingPages && <GeneratingOverlay />}
    </div>
  );
}

function GeneratingOverlay() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,15,0.5)', backdropFilter: 'blur(2px)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#000',
          border: `1px solid ${TOOL.accent}`,
          borderRadius: 100,
          padding: '14px 26px',
          boxShadow: '0 0 50px rgba(83,20,255,0.4)',
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        <span style={{ fontFamily: "'adidasFG', system-ui, sans-serif", color: TOOL.primary, fontSize: 14, fontWeight: 500 }}>Generating pages…</span>
      </div>
    </div>
  );
}
