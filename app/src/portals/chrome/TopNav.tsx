import type { Surface } from '../types';
import { TOOL, ui } from './tokens';
import { Chevron, Settings } from './Icons';

interface TopNavProps {
  surface: Surface;
  onSurface: (s: Surface) => void;
}

const TABS: { id: Surface; label: string }[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'preview', label: 'Preview' },
];

export function TopNav({ surface, onSurface }: TopNavProps) {
  return (
    <div
      style={{
        background: TOOL.panel,
        borderBottom: `1px solid ${TOOL.border}`,
        padding: '26px 20px 24px',
        position: 'relative',
        zIndex: 30,
      }}
    >
      <div style={{ position: 'relative', height: 40, width: '100%' }}>
        {/* Left: project switcher + brand */}
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              border: `1px solid ${TOOL.border}`,
              borderRadius: 64,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 16px',
              color: TOOL.mute,
            }}
          >
            <img src="/favicon.svg" alt="Portals" style={{ width: 20, height: 20, borderRadius: 5, display: 'block' }} />
            <Chevron size={16} />
          </div>
          <div style={{ width: 1, height: 40, background: TOOL.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/Adidas.png"
              alt="adidas Group"
              style={{ width: 34, height: 24, objectFit: 'contain', display: 'block' }}
            />
            <span style={ui({ color: TOOL.primary, fontSize: 14, fontWeight: 500 })}>adidas Group</span>
          </div>
          <div style={{ width: 1, height: 40, background: TOOL.border }} />
        </div>

        {/* Center: surface tabs */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {TABS.map((tab) => {
            const active = tab.id === surface;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSurface(tab.id)}
                style={ui({
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  fontWeight: active ? 500 : 400,
                  color: active ? TOOL.primary : TOOL.mute,
                })}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: status + settings + avatar */}
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 1, height: 40, background: TOOL.border }} />
          <StagingBadge />
          <span style={{ color: TOOL.mute, display: 'inline-flex' }}>
            <Settings size={22} />
          </span>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#5314ff,#9a7bff)',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#3ddc84',
                border: `1.5px solid ${TOOL.panel}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StagingBadge() {
  return (
    <div
      style={{
        background: '#000',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e0a23c', display: 'inline-block' }} />
      <span style={ui({ color: TOOL.content, fontSize: 14 })}>Staging</span>
    </div>
  );
}
