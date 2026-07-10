import { useEffect, useState } from 'react';
import type { ComponentKind, NodeContent, PortalNode, ThemeId } from '../types';
import { TOOL, ui, mono } from '../chrome/tokens';
import { Close, Columns, Eye, Globe, Mail, Pencil, Sparkle } from '../chrome/Icons';
import { PageRenderer } from '../render/PageRenderer';
import { NewsletterRenderer } from '../render/NewsletterRenderer';
import { THEME_META } from '../render/themes';
import { BlockEditPanel } from './BlockEditPanel';
import { embeddedBlocks } from '../data/graph';

const THEMES: ThemeId[] = ['editorial', 'technical', 'index'];

type Embed = { id: string; name: string; content: NodeContent };
type Channel = 'web' | 'newsletter';

interface PreviewProps {
  node: PortalNode;
  nodes: Record<string, PortalNode>;
  theme: ThemeId;
  compare: boolean;
  onTheme: (t: ThemeId) => void;
  onToggleCompare: () => void;
  onExit: () => void;
  onRefresh: (id: string) => void;
  onEditContent: (id: string, change: Partial<NodeContent>) => void;
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

export function Preview({ node, nodes, theme, compare, onTheme, onToggleCompare, onExit, onRefresh, onEditContent }: PreviewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedKind, setSelectedKind] = useState<ComponentKind | null>(null);
  const [channel, setChannel] = useState<Channel>('web');

  // Living connections — blocks this page transcludes via reference edges.
  const embeds = embeddedBlocks(node, nodes).map((b) => ({ id: b.id, name: b.name, content: b.content }));

  const toggleEditing = () => {
    setEditing((e) => !e);
    setSelectedKind(null);
  };

  useEffect(() => {
    if (!selectedKind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedKind(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedKind]);

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

        {!compare && channel === 'web' && (
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

        {!compare && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div style={{ display: 'flex', gap: 4, background: TOOL.bg, border: `1px solid ${TOOL.border}`, borderRadius: 8, padding: 4 }}>
              <button
                type="button"
                onClick={() => setChannel('web')}
                style={ui({
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, background: channel === 'web' ? TOOL.accent : 'transparent', color: channel === 'web' ? '#fff' : TOOL.mute,
                })}
              >
                <Globe size={12} /> Web page
              </button>
              <button
                type="button"
                onClick={() => setChannel('newsletter')}
                style={ui({
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, background: channel === 'newsletter' ? TOOL.accent : 'transparent', color: channel === 'newsletter' ? '#fff' : TOOL.mute,
                })}
              >
                <Mail size={12} /> Newsletter
              </button>
            </div>
            {channel === 'newsletter' && (
              <span style={ui({ color: TOOL.faint, fontSize: 10.5 })}>Same node — nothing rewritten</span>
            )}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {!compare && channel === 'web' && (
            <button type="button" onClick={toggleEditing} style={dockBtn(editing)}>
              <Pencil size={14} /> {editing ? 'Editing' : 'Edit page'}
            </button>
          )}
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
          {channel === 'web' && (
            <button type="button" onClick={onToggleCompare} style={dockBtn(compare)}>
              <Columns size={14} /> Compare themes
            </button>
          )}
          <button type="button" onClick={onExit} style={dockBtn(false)}>
            <Close size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Surface */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {compare ? (
            <ComparePanes node={node} embeds={embeds} />
          ) : channel === 'newsletter' ? (
            <MailFrame node={node}>
              <NewsletterRenderer content={node.content} />
            </MailFrame>
          ) : (
            <BrowserFrame url={urlFor(node, nodes)}>
              <PageRenderer
                content={node.content}
                theme={theme}
                context={node.context}
                editable={editing}
                selectedKind={selectedKind}
                onSelectBlock={setSelectedKind}
                embeds={embeds}
              />
            </BrowserFrame>
          )}

          {refreshing && <RefreshOverlay />}
        </div>

        {editing && selectedKind && (
          <BlockEditPanel
            nodeId={node.id}
            kind={selectedKind}
            content={node.content}
            onApply={(change) => onEditContent(node.id, change)}
            onClose={() => setSelectedKind(null)}
          />
        )}
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

function ComparePanes({ node, embeds }: { node: PortalNode; embeds: Embed[] }) {
  const [leftTheme, setLeftTheme] = useState<ThemeId>('editorial');
  const [rightTheme, setRightTheme] = useState<ThemeId>('technical');

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: TOOL.border, minHeight: 0 }}>
      <ComparePane node={node} theme={leftTheme} onTheme={setLeftTheme} embeds={embeds} />
      <ComparePane node={node} theme={rightTheme} onTheme={setRightTheme} embeds={embeds} />
    </div>
  );
}

function ComparePane({ node, theme, onTheme, embeds }: { node: PortalNode; theme: ThemeId; onTheme: (t: ThemeId) => void; embeds: Embed[] }) {
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
        <PageRenderer content={node.content} theme={theme} context={node.context} embeds={embeds} />
      </div>
    </div>
  );
}

function MailFrame({ node, children }: { node: PortalNode; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: 24, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          minHeight: 0,
        }}
      >
        <div style={{ padding: '14px 18px', background: '#1b1b1b', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={mono({ color: '#7a7a7a', fontSize: 11, width: 42, flexShrink: 0 })}>From</span>
            <span style={mono({ color: '#d8d8d8', fontSize: 11 })}>adidas Group Newsroom &lt;news@adidas-group.com&gt;</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={mono({ color: '#7a7a7a', fontSize: 11, width: 42, flexShrink: 0 })}>Subject</span>
            <span style={ui({ color: '#fff', fontSize: 12, fontWeight: 500 })}>{node.content.title ?? node.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={mono({ color: '#7a7a7a', fontSize: 11, width: 42, flexShrink: 0 })}>To</span>
            <span style={mono({ color: '#9a9a9a', fontSize: 11 })}>subscribers@adidas-group.com</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</div>
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
