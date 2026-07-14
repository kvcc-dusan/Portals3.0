import { useEffect, useState } from 'react';

/**
 * Full-screen entry slide shown on every load, before the demo itself.
 * Styled to match the concept-walkthrough deck (public/concept-walkthrough.html),
 * NOT the tool chrome — the palettes differ deliberately.
 */

const DECK = {
  ground: '#0a0a0d',
  line: '#26242c',
  primary: '#f4f3f7',
  content: '#c8c6d0',
  mute: '#86838f',
  faint: '#514f5a',
  accent: '#7c4dff',
  display: "'adidasFG Compressed', system-ui, sans-serif",
  ui: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace",
} as const;

const SURFACES: { label: string; blurb: string }[] = [
  { label: 'Workspace', blurb: 'The site as a mind map. Ingest raw content, review the structure AI proposes, adjust it, place it.' },
  { label: 'Maintenance', blurb: 'Site health at a glance: drifted figures, unreviewed AI content, stale pages — each resolved in one click.' },
  { label: 'Preview', blurb: 'The same content rendered as a finished page in three themes, or as an email newsletter.' },
];

interface SplashScreenProps {
  onDismiss: () => void;
}

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => setLeaving((l) => l || true);

  useEffect(() => {
    const onKey = () => dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDismiss, 400);
    return () => clearTimeout(t);
  }, [leaving, onDismiss]);

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        cursor: 'pointer',
        background: `radial-gradient(90% 60% at 82% -8%, rgba(124,77,255,0.22), transparent 62%), radial-gradient(70% 55% at 10% 108%, rgba(124,77,255,0.16), transparent 62%), ${DECK.ground}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 72px)',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Fixed chrome */}
      <span
        style={{
          position: 'absolute',
          top: 28,
          left: 32,
          fontFamily: DECK.mono,
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: DECK.mute,
        }}
      >
        Portals · Concept Demo
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: DECK.mono,
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: DECK.faint,
        }}
      >
        Click anywhere or press any key to enter
      </span>

      {/* Content */}
      <div
        style={{
          maxWidth: 760,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          animation: 'splashIn 0.6s ease both',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontFamily: DECK.mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: DECK.accent }}>
            Interactive Concept Demo
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: DECK.display,
              fontWeight: 700,
              fontSize: 'clamp(56px, 8vw, 108px)',
              lineHeight: 0.98,
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
              color: DECK.primary,
            }}
          >
            Portals 3.0
          </h1>
        </div>

        <p
          style={{
            margin: 0,
            fontFamily: DECK.ui,
            fontSize: 'clamp(15.5px, 1.5vw, 18px)',
            lineHeight: 1.6,
            color: DECK.content,
            maxWidth: '62ch',
          }}
        >
          A working prototype of an AI-driven approach to content management. The site lives as a graph of content,
          structure and connections — <strong style={{ color: DECK.primary, fontWeight: 600 }}>people curate the graph, and the
          system generates every page, design included</strong>. Everything here is clickable, and every flow runs end to end.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SURFACES.map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 24,
                padding: '13px 0',
                borderTop: `1px solid ${DECK.line}`,
              }}
            >
              <span
                style={{
                  fontFamily: DECK.mono,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: DECK.primary,
                  width: 118,
                  flexShrink: 0,
                }}
              >
                {s.label}
              </span>
              <span style={{ fontFamily: DECK.ui, fontSize: 14, lineHeight: 1.55, color: DECK.mute }}>{s.blurb}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${DECK.line}` }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontFamily: DECK.ui, fontSize: 13, lineHeight: 1.55, color: DECK.mute }}>
            AI responses and data sources are simulated — the flows are real, the integrations are not.
          </p>
          <p style={{ margin: 0, fontFamily: DECK.ui, fontSize: 12, lineHeight: 1.55, color: DECK.faint }}>
            Deeper material — the concept walkthrough and documentation — is available from the profile menu.
          </p>
        </div>
      </div>
    </div>
  );
}
