import { useEffect, useRef, useState } from 'react';
import type { Surface } from '../types';
import { TOOL, ui } from './tokens';
import { Chevron, Settings } from './Icons';

interface TopNavProps {
  surface: Surface;
  onSurface: (s: Surface) => void;
  published: boolean;
}

const PROFILE_LINKS = [
  { label: 'Concept walkthrough', href: 'https://claude.ai/code/artifact/6e4d90a6-c1a8-4d4c-925c-e91dcbeb5006' },
  { label: 'Documentation', href: 'https://claude.ai/code/artifact/879d7105-01f5-45e5-a237-4a8c30cc5d8d' },
];

const TABS: { id: Surface; label: string }[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'preview', label: 'Preview' },
];

export function TopNav({ surface, onSurface, published }: TopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <div
      style={{
        background: TOOL.panel,
        borderBottom: `1px solid ${TOOL.border}`,
        padding: '12px 20px',
        position: 'relative',
        zIndex: 30,
      }}
    >
      <div style={{ position: 'relative', height: 32, width: '100%' }}>
        {/* Left: project switcher + brand */}
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              border: `1px solid ${TOOL.border}`,
              borderRadius: 64,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 14px',
              color: TOOL.mute,
            }}
          >
            <img src="/favicon.svg" alt="Portals" style={{ width: 18, height: 18, borderRadius: 5, display: 'block' }} />
            <Chevron size={14} />
          </div>
          <div style={{ width: 1, height: 32, background: TOOL.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/Adidas.png"
              alt="adidas Group"
              style={{ width: 30, height: 20, objectFit: 'contain', display: 'block' }}
            />
            <span style={ui({ color: TOOL.primary, fontSize: 13, fontWeight: 500 })}>adidas Group</span>
          </div>
          <div style={{ width: 1, height: 32, background: TOOL.border }} />
        </div>

        {/* Center: surface tabs */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            height: 32,
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
                  padding: '6px 16px',
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
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 1, height: 32, background: TOOL.border }} />
          <StagingBadge published={published} />
          <span style={{ color: TOOL.mute, display: 'inline-flex' }}>
            <Settings size={19} />
          </span>
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setProfileOpen((o) => !o)}
              style={{
                width: 23,
                height: 23,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#5314ff,#9a7bff)',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -1,
                  right: -1,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#3ddc84',
                  border: `1.5px solid ${TOOL.panel}`,
                }}
              />
            </div>
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  minWidth: 190,
                  background: TOOL.panel,
                  border: `1px solid ${TOOL.border}`,
                  borderRadius: 12,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
                  zIndex: 40,
                }}
              >
                {PROFILE_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileOpen(false)}
                    style={ui({
                      display: 'block',
                      color: TOOL.content,
                      fontSize: 13,
                      textDecoration: 'none',
                      padding: '8px 10px',
                      borderRadius: 7,
                    })}
                    onMouseEnter={(e) => (e.currentTarget.style.background = TOOL.borderSoft)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StagingBadge({ published }: { published: boolean }) {
  return (
    <div
      style={{
        background: '#000',
        border: `1px solid ${TOOL.border}`,
        borderRadius: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 13px',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: published ? '#3ddc84' : '#e0a23c', display: 'inline-block' }} />
      <span style={ui({ color: TOOL.content, fontSize: 13 })}>{published ? 'Live' : 'Staging'}</span>
    </div>
  );
}
