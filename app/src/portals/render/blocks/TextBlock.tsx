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
        maxWidth: theme === 'editorial' ? 720 : '100%',
      }}
    >
      {body.map((para, i) => (
        <p
          key={i}
          style={{
            fontFamily: PAGE.body,
            fontSize: technical ? 14.5 : theme === 'editorial' ? 17 : 16,
            lineHeight: technical ? 1.55 : theme === 'editorial' ? 1.7 : 1.65,
            color: PAGE.ink,
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
