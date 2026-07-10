import { useState, type ReactNode } from 'react';
import { TOOL, ui, mono } from './tokens';
import { Pill } from './Pill';
import { Plus, Trash, Eye } from './Icons';

interface ToolbarProps {
  breadcrumb: string;
  canPreview: boolean;
  canDelete: boolean;
  published: boolean;
  pageCount: number;
  onPreview: () => void;
  onAddNode: () => void;
  onDeleteNode: () => void;
  onPublish: () => void;
}

export function Toolbar({ breadcrumb, canPreview, canDelete, published, pageCount, onPreview, onAddNode, onDeleteNode, onPublish }: ToolbarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  const doPublish = () => {
    setConfirmOpen(false);
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      onPublish();
    }, 1000);
  };

  const doSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div style={{ background: TOOL.panel, borderBottom: `1px solid ${TOOL.border}`, padding: '8px 16px', zIndex: 20 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        {/* Left: breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={mono({ color: TOOL.mute, fontSize: 11, letterSpacing: '0.04em' })}>SITE /</span>
          <span style={ui({ color: TOOL.content, fontSize: 12 })}>{breadcrumb}</span>
        </div>

        {/* Center: node tools */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 12, color: TOOL.mute }}>
          <ToolIcon title="Add node" onClick={onAddNode} active><Plus /></ToolIcon>
          <Divider />
          <ToolIcon title="Delete node" onClick={canDelete ? onDeleteNode : undefined} active><Trash /></ToolIcon>
          <Divider />
          <ToolIcon title="Preview page" onClick={canPreview ? onPreview : undefined} active><Eye /></ToolIcon>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <Pill variant="ghost" size="sm" onClick={doSave}>{saved ? 'Saved ✓' : 'Save'}</Pill>
          <div style={{ position: 'relative' }}>
            <Pill
              variant="solid"
              size="sm"
              disabled={publishing || published}
              onClick={() => setConfirmOpen((o) => !o)}
            >
              {publishing ? 'Publishing…' : published ? 'Published' : 'Publish'}
            </Pill>

            {confirmOpen && !published && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 260,
                  background: TOOL.panel,
                  border: `1px solid ${TOOL.border}`,
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
                  zIndex: 40,
                }}
              >
                <p style={ui({ color: TOOL.content, fontSize: 12.5, lineHeight: 1.5, margin: 0 })}>
                  Publish <strong style={{ color: TOOL.primary }}>{pageCount} pages</strong> to{' '}
                  <span style={mono({ color: TOOL.mute, fontSize: 11.5 })}>adidas-group.com</span>?
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Pill variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Pill>
                  <Pill variant="accent" size="sm" onClick={doPublish}>Confirm</Pill>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ children, onClick, active, title }: { children: ReactNode; onClick?: () => void; active?: boolean; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        display: 'inline-flex',
        cursor: onClick ? 'pointer' : 'default',
        color: active && onClick ? TOOL.primary : TOOL.mute,
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 18, background: TOOL.border, display: 'inline-block' }} />;
}
