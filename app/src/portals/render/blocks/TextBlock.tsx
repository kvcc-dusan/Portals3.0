import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function TextBlock({ content, theme }: BlockProps) {
  const body = content.body ?? [];
  if (body.length === 0) return null;

  const technical = theme === 'technical';

  return (
    <div
      style={{
        columnCount: technical ? 2 : 1,
        columnGap: 40,
        maxWidth: theme === 'editorial' ? 680 : '100%',
      }}
    >
      {body.map((para, i) => (
        <p
          key={i}
          style={{
            fontFamily: PAGE.body,
            fontSize: technical ? 15 : theme === 'editorial' ? 19 : 16,
            lineHeight: technical ? 1.6 : 1.75,
            color: '#1c1c1c',
            margin: 0,
            marginBottom: i < body.length - 1 ? (technical ? 16 : 24) : 0,
            breakInside: 'avoid-column',
          }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}
