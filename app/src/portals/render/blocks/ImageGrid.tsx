import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function ImageGrid({ content, theme }: BlockProps) {
  const images = content.images ?? [];
  if (images.length === 0) return null;

  const technical = theme === 'technical';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: technical
          ? 'repeat(auto-fit, minmax(180px, 1fr))'
          : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: technical ? 12 : 24,
      }}
    >
      {images.map((image, i) => (
        <figure key={i} style={{ margin: 0 }}>
          <div
            style={{
              width: '100%',
              aspectRatio: technical ? '1 / 1' : '4 / 3',
              overflow: 'hidden',
              background: PAGE.wash,
            }}
          >
            <img
              src={image.src}
              alt={image.caption ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          {image.caption && !technical && (
            <figcaption
              style={{
                marginTop: 10,
                fontFamily: PAGE.body,
                fontSize: 12,
                lineHeight: 1.45,
                color: PAGE.mute,
              }}
            >
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
