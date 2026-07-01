import { useState } from 'react';
import type { AppState, CorporateContext, EdgeId, PortalNode, Surface, ThemeId } from './types';
import { INITIAL_NODES, ROOT_ID, getRefreshedContent } from './data/graph';
import { fieldOf } from './data/sources';
import { TopNav } from './chrome/TopNav';
import { Toolbar } from './chrome/Toolbar';
import { Canvas } from './workspace/Canvas';
import { Inspector } from './workspace/Inspector';
import { Preview } from './preview/Preview';
import { IngestModal } from './ingest/IngestModal';
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
  generatingPages: false,
  pendingRefresh: null,
};

export function Portals() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const patch = (next: Partial<AppState>) => setState((s) => ({ ...s, ...next }));

  const updateNode = (id: string, change: Partial<PortalNode>) =>
    setState((s) => ({ ...s, nodes: { ...s.nodes, [id]: { ...s.nodes[id], ...change } } }));

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
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, content: { ...node.content, ...change }, origin: 'human-edited', updatedAt: 'Just now' } } };
    });
  const toggleCollapse = (id: string) =>
    setState((s) => ({
      ...s,
      collapsed: s.collapsed.includes(id) ? s.collapsed.filter((c) => c !== id) : [...s.collapsed, id],
    }));

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
  const refresh = (id: string) =>
    setState((s) => {
      const node = s.nodes[id];
      if (!node) return s;
      return { ...s, pendingRefresh: { id, before: node.content, after: getRefreshedContent(node) } };
    });

  const approveRefresh = () => {
    const pid = state.pendingRefresh?.id;
    setState((s) => {
      const pr = s.pendingRefresh;
      if (!pr || !s.nodes[pr.id]) return s;
      return {
        ...s,
        nodes: { ...s.nodes, [pr.id]: { ...s.nodes[pr.id], content: pr.after, origin: 'synced', updatedAt: 'Just now' } },
        pendingRefresh: null,
        justRefreshedId: pr.id,
      };
    });
    if (pid) setTimeout(() => setState((s) => (s.justRefreshedId === pid ? { ...s, justRefreshedId: null } : s)), 1400);
  };

  const rejectRefresh = () => patch({ pendingRefresh: null });

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
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, content, bindings, origin: 'synced', updatedAt: 'Just now' } } };
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
      patch({ ingestOpen: false });
      return;
    }
    const ids = proposed.map((n) => n.id);
    const primary = proposed.find((n) => !ids.includes(n.parentId ?? ''))?.id ?? proposed[0].id;

    // Step 1: nodes land on the canvas un-rendered, "Generating pages…" runs.
    setState((s) => {
      const added = Object.fromEntries(
        proposed.map((n) => [n.id, { ...n, rendered: false, origin: 'ai-generated' as const, updatedAt: 'Just now' }]),
      );
      return { ...s, nodes: { ...s.nodes, ...added }, ingestOpen: false, selectedId: primary, selectedEdgeId: null, focusId: primary, generatingPages: true };
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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: TOOL.bg, display: 'flex', flexDirection: 'column' }}>
      <TopNav surface={state.surface} onSurface={switchSurface} />

      {state.surface === 'workspace' && (
        <>
          <Toolbar
            breadcrumb={breadcrumb}
            canPreview={!!state.selectedId}
            onIngest={() => patch({ ingestOpen: true })}
            onPreview={() => openPreview(state.selectedId)}
          />
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <div style={{ position: 'absolute', inset: 0, right: 320 }}>
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
            </div>
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
          />
        </div>
      )}

      {state.ingestOpen && <IngestModal onClose={() => patch({ ingestOpen: false })} onPlace={placeProposed} />}

      {state.pendingRefresh && state.nodes[state.pendingRefresh.id] && (
        <RefreshDiffModal
          node={state.nodes[state.pendingRefresh.id]}
          before={state.pendingRefresh.before}
          after={state.pendingRefresh.after}
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
