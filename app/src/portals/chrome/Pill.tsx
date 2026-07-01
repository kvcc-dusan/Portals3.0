import type { ReactNode } from 'react';
import { TOOL, ui } from './tokens';

type Variant = 'ghost' | 'solid' | 'accent';

interface PillProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  title?: string;
}

export function Pill({ children, onClick, variant = 'ghost', icon, disabled, size = 'md', title }: PillProps) {
  const pad = size === 'sm' ? '4px 16px' : '10px 20px';
  const fontSize = size === 'sm' ? 12 : 14;

  const styles: Record<Variant, React.CSSProperties> = {
    ghost: { background: 'transparent', border: `1px solid ${TOOL.border}`, color: TOOL.primary },
    solid: { background: TOOL.primary, border: '1px solid transparent', color: '#0f0f0f' },
    accent: { background: TOOL.accent, border: '1px solid transparent', color: '#fff' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={ui({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: pad,
        borderRadius: 100,
        fontSize,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        ...styles[variant],
      })}
    >
      {icon}
      {children}
    </button>
  );
}
