import { Component, type ReactNode } from 'react';
import { TOOL, ui, mono } from './chrome/tokens';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches render-time exceptions so a thrown error shows a readable panel
 * instead of unmounting the whole tree to a blank white screen. (Note: this
 * cannot catch an infinite loop / freeze — those are prevented at the source.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Surface in the console for diagnosis during the demo build.
    console.error('Portals crashed:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: TOOL.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            width: '100%',
            background: TOOL.panel,
            border: `1px solid ${TOOL.border}`,
            borderRadius: 14,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span style={ui({ color: TOOL.primary, fontSize: 16, fontWeight: 600 })}>Something broke</span>
          <p style={ui({ color: TOOL.mute, fontSize: 13, lineHeight: 1.5, margin: 0 })}>
            The prototype hit a runtime error and recovered to this panel instead of a blank screen. Reset to continue.
          </p>
          <pre
            style={mono({
              color: TOOL.error,
              fontSize: 12,
              lineHeight: 1.5,
              background: TOOL.bg,
              border: `1px solid ${TOOL.border}`,
              borderRadius: 8,
              padding: 14,
              margin: 0,
              maxHeight: 220,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            })}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              style={ui({
                padding: '10px 20px',
                borderRadius: 100,
                border: 'none',
                background: TOOL.primary,
                color: '#0f0f0f',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              })}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={ui({
                padding: '10px 20px',
                borderRadius: 100,
                border: `1px solid ${TOOL.border}`,
                background: 'transparent',
                color: TOOL.content,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              })}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
