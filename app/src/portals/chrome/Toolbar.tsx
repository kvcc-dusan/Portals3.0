import type { ReactNode } from 'react';
import { TOOL, ui, mono } from './tokens';
import { Pill } from './Pill';
import { Plus, ArrowUp, ArrowDown, Trash, Undo, Redo, Eye, Sparkle } from './Icons';

interface ToolbarProps {
  breadcrumb: string;
  canPreview: boolean;
  onIngest: () => void;
  onPreview: () => void;
}

export function Toolbar({ breadcrumb, canPreview, onIngest, onPreview }: ToolbarProps) {
  return (
    <div style={{ background: TOOL.panel, borderBottom: `1px solid ${TOOL.border}`, padding: '12px 16px', zIndex: 20 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        {/* Left: breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={mono({ color: TOOL.mute, fontSize: 11, letterSpacing: '0.04em' })}>SITE /</span>
          <span style={ui({ color: TOOL.content, fontSize: 12 })}>{breadcrumb}</span>
        </div>

        {/* Center: node tools */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 12, color: TOOL.mute }}>
          <ToolIcon title="Add node"><Plus /></ToolIcon>
          <Divider />
          <ToolIcon title="Move up"><ArrowUp /></ToolIcon>
          <ToolIcon title="Move down"><ArrowDown /></ToolIcon>
          <Divider />
          <ToolIcon title="Delete node"><Trash /></ToolIcon>
          <Divider />
          <ToolIcon title="Undo"><Undo /></ToolIcon>
          <ToolIcon title="Redo"><Redo /></ToolIcon>
          <Divider />
          <ToolIcon title="Preview page" onClick={canPreview ? onPreview : undefined} active><Eye /></ToolIcon>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill variant="ghost" icon={<Sparkle />} onClick={onIngest}>Ingest</Pill>
          <Pill variant="ghost">Save</Pill>
          <Pill variant="solid">Publish</Pill>
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
