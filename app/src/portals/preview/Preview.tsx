import { useState } from 'react';
import type { PortalNode, ThemeId } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { Close, Columns, Eye, Sparkle } from '../chrome/Icons';
import { PageRenderer } from '../render/PageRenderer';
import { THEME_META } from '../render/themes';

const THEMES: ThemeId[] = ['editorial', 'technical', 'index'];

interface PreviewProps {
  node: PortalNode;
  nodes: Record<string, PortalNode>;
  theme: ThemeId;
  compare: boolean;
  onTheme: (t: ThemeId) => void;
  onToggleCompare: () => void;
  onExit: () => void;
  onRefresh: (id: string) => void;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function urlFor(node: PortalNode, nodes: Record<string, PortalNode>): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  let cur: PortalNode | undefined = node;
  while (cur && cur.type !== 'site' && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(slug(cur.name));
    cur = cur.parentId ? nodes[cur.parentId] : undefined;
  }
  return `adidas-group.com/${parts.join('/')}`;
}

export function Preview({ node, nodes, theme, compare, onTheme, onToggleCompare, onExit, onRefresh }: PreviewProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Drafts an AI refresh for the previewed section. onRefresh stages a diff for
  // approval; once approved, node.content updates and the page recomposes live.
  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      onRefresh(node.id);
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: TOOL.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Control dock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          borderBottom: `1px solid ${TOOL.border}`,
          background: TOOL.panel,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: TOOL.mute, display: 'inline-flex' }}><Eye size={16} /></span>
          <span style={ui({ color: TOOL.content, fontSize: 13 })}>{node.name}</span>
          <span style={mono({ color: TOOL.faint, fontSize: 10, letterSpacing: '0.06em' })}>{node.context.toUpperCase()}</span>
        </div>

        {!compare && (
          <div style={{ display: 'flex', gap: 4, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 8, padding: 4, marginLeft: 8 }}>
            {THEMES.map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTheme(t)}
                  style={ui({
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? TOOL.accent : 'transparent',
                    color: active ? '#fff' : TOOL.mute,
                  })}
                >
                  {THEME_META[t].label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* AI maintenance refresh — runs on the page in view */}
          <button
            type="button"
            onClick={doRefresh}
            disabled={refreshing}
            style={dockBtn(false, true)}
          >
            {refreshing ? <Spinner /> : <Sparkle size={14} />}
            {refreshing ? 'Refreshing…' : 'Refresh section'}
          </button>
          <button type="button" onClick={onToggleCompare} style={dockBtn(compare)}>
            <Columns size={14} /> Compare themes
          </button>
          <button type="button" onClick={onExit} style={dockBtn(false)}>
            <Close size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Surface */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {compare ? (
          <ComparePanes node={node} />
        ) : (
          <BrowserFrame url={urlFor(node, nodes)}>
            <PageRenderer content={node.content} theme={theme} context={node.context} />
          </BrowserFrame>
        )}

        {refreshing && <RefreshOverlay />}
      </div>
    </div>
  );
}

function RefreshOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        background: 'rgba(15,15,15,0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: TOOL.panel,
          border: `1px solid ${TOOL.accent}`,
          borderRadius: 100,
          padding: '12px 22px',
          boxShadow: '0 0 40px rgba(83,20,255,0.4)',
        }}
      >
        <Spinner />
        <span style={ui({ color: TOOL.primary, fontSize: 14, fontWeight: 500 })}>Refreshing section…</span>
      </div>
    </div>
  );
}

function ComparePanes({ node }: { node: PortalNode }) {
  const [leftTheme, setLeftTheme] = useState<ThemeId>('editorial');
  const [rightTheme, setRightTheme] = useState<ThemeId>('technical');

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: TOOL.border, minHeight: 0 }}>
      <ComparePane node={node} theme={leftTheme} onTheme={setLeftTheme} />
      <ComparePane node={node} theme={rightTheme} onTheme={setRightTheme} />
    </div>
  );
}

function ComparePane({ node, theme, onTheme }: { node: PortalNode; theme: ThemeId; onTheme: (t: ThemeId) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: TOOL.bg }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, background: TOOL.panel }}>
        <div style={{ display: 'flex', gap: 3, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 7, padding: 3 }}>
          {THEMES.map((t) => {
            const active = theme === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTheme(t)}
                style={ui({
                  padding: '4px 10px',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 500,
                  background: active ? TOOL.accent : 'transparent',
                  color: active ? '#fff' : TOOL.mute,
                })}
              >
                {THEME_META[t].label}
              </button>
            );
          })}
        </div>
        <span style={ui({ color: TOOL.faint, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{THEME_META[theme].note}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <PageRenderer content={node.content} theme={theme} context={node.context} />
      </div>
    </div>
  );
}

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: 24, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#1b1b1b', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: '#2a2a2a', borderRadius: 7, padding: '6px 12px', textAlign: 'center' }}>
            <span style={mono({ color: '#bdbdbd', fontSize: 12 })}>{url}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.35)',
        borderTopColor: '#fff',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

function dockBtn(active: boolean, accent = false): React.CSSProperties {
  return ui({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '8px 14px',
    borderRadius: 100,
    border: `1px solid ${accent ? TOOL.accent : active ? TOOL.accent : TOOL.border}`,
    background: accent ? 'rgba(83,20,255,0.18)' : active ? 'rgba(83,20,255,0.15)' : 'transparent',
    color: accent ? '#fff' : active ? '#fff' : TOOL.content,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  });
}
