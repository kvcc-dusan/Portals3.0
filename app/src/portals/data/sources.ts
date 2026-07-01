import type { DataSource, SourceField } from '../types';

/**
 * Mock corporate data registry (demo only — no real connectors). Sources expose
 * fields whose `value` is the CURRENT upstream figure. A node stat bound to a
 * field is "stale" when the field's value has moved past the stat's syncedValue.
 * Swappable for real connectors behind these same lookups.
 */

export const DATA_SOURCES: DataSource[] = [
  { id: 'finance-db', name: 'Finance DB', kind: 'Financial system' },
  { id: 'sap-bw', name: 'SAP BW', kind: 'Reporting warehouse' },
  { id: 'esg-dw', name: 'ESG Data Warehouse', kind: 'Sustainability ledger' },
];

export const SOURCE_FIELDS: SourceField[] = [
  { sourceId: 'finance-db', key: 'net-sales-q3', label: 'Net sales (Q3)', value: '€6.9B' },
  { sourceId: 'finance-db', key: 'operating-profit', label: 'Operating profit (Q3)', value: '€736M' },
  { sourceId: 'finance-db', key: 'net-sales-fy', label: 'Net sales (FY24)', value: '€23.7B' },
  { sourceId: 'sap-bw', key: 'gross-margin', label: 'Gross margin', value: '51.8%' },
  { sourceId: 'sap-bw', key: 'cn-growth', label: 'Currency-neutral growth', value: '+12.7%' },
  { sourceId: 'esg-dw', key: 'renewable-elec', label: 'Renewable electricity', value: '98%' },
  { sourceId: 'esg-dw', key: 'abs-emissions', label: 'Absolute emissions vs 2017', value: '−30%' },
];

export const sourceById = (id: string): DataSource | undefined => DATA_SOURCES.find((s) => s.id === id);

export const fieldOf = (sourceId: string, key: string): SourceField | undefined =>
  SOURCE_FIELDS.find((f) => f.sourceId === sourceId && f.key === key);
