import { PAGE } from './page-tokens';
import type { BlockProps } from './types';

export function DataTable({ content }: BlockProps) {
  const table = content.table;
  if (!table) return null;

  return (
    <figure style={{ margin: 0, width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: PAGE.body,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <thead>
          <tr>
            {table.columns.map((col, i) => (
              <th
                key={col}
                style={{
                  textAlign: i === 0 ? 'left' : 'right',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: PAGE.mute,
                  padding: '0 0 10px',
                  borderBottom: `2px solid ${PAGE.ink}`,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => {
            const isTotal = r === table.rows.length - 1 && row[0].toLowerCase() === 'total';
            return (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    style={{
                      textAlign: c === 0 ? 'left' : 'right',
                      fontSize: 14,
                      fontWeight: isTotal ? 700 : c === 0 ? 600 : 400,
                      color: PAGE.ink,
                      padding: '12px 0',
                      borderBottom: `1px solid ${PAGE.line}`,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {table.caption && (
        <figcaption
          style={{
            marginTop: 12,
            fontFamily: PAGE.body,
            fontSize: 12,
            color: PAGE.faint,
          }}
        >
          {table.caption}
        </figcaption>
      )}
    </figure>
  );
}
