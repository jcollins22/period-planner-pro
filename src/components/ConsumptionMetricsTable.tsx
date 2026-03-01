import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { generateConsumptionPeriodData } from '@/data/consumptionData';

const allPeriods = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);
const quarters: { label: string; periods: string[] }[] = [
  { label: 'Q1', periods: ['P1', 'P2', 'P3'] },
  { label: 'Q2', periods: ['P4', 'P5', 'P6'] },
  { label: 'Q3', periods: ['P7', 'P8', 'P9'] },
  { label: 'Q4', periods: ['P10', 'P11', 'P12'] },
  { label: 'P13', periods: ['P13'] },
];

interface MetricDef {
  label: string;
  drillable: boolean;
}

const metrics: MetricDef[] = [
  { label: 'Sales', drillable: true },
  { label: 'Velocity', drillable: true },
  { label: 'HH Penetration', drillable: false },
  { label: 'Total Repeat Rate', drillable: false },
  { label: '$/Household', drillable: false },
];

const FROZEN_TYPES = ['Milk', 'Dark', 'Greek'];
const FROZEN_PACKAGES = ['8oz', '18oz', '24oz'];
const FD_TYPES = ['Milk', 'Dark', 'Creme'];
const FD_PACKAGES = ['1.7oz', '3.4oz', '6.5oz'];

const formatVal = (metric: string, v: number): string => {
  if (metric === 'Sales') return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'Velocity') return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'HH Penetration' || metric === 'Total Repeat Rate') return v.toFixed(1) + '%';
  if (metric === '$/Household') return '$' + v.toFixed(2);
  return String(v);
};

export default function ConsumptionMetricsTable() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const data = useMemo(() => generateConsumptionPeriodData('default'), []);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Build rows
  type Row = {
    key: string;
    label: string;
    metric: string;
    rowName: string;
    indent: number;
    expandable: boolean;
    expanded: boolean;
    onToggle?: () => void;
  };

  const rows: Row[] = [];

  for (const m of metrics) {
    const mExp = expanded.has(m.label);
    rows.push({
      key: m.label, label: m.label, metric: m.label, rowName: 'Total',
      indent: 0, expandable: true, expanded: mExp, onToggle: () => toggle(m.label),
    });

    if (!mExp) continue;

    if (m.drillable) {
      for (const segment of ['Frozen', 'FD'] as const) {
        const segKey = `${m.label}-${segment}`;
        const segExp = expanded.has(segKey);
        rows.push({
          key: segKey, label: segment, metric: m.label, rowName: segment,
          indent: 1, expandable: true, expanded: segExp, onToggle: () => toggle(segKey),
        });

        if (!segExp) continue;

        const typeLabels = segment === 'Frozen' ? FROZEN_TYPES : FD_TYPES;
        const pkgLabels = segment === 'Frozen' ? FROZEN_PACKAGES : FD_PACKAGES;

        // By Type
        const typeKey = `${segKey}-Type`;
        const typeExp = expanded.has(typeKey);
        rows.push({
          key: typeKey, label: 'By Type', metric: m.label, rowName: '',
          indent: 2, expandable: true, expanded: typeExp, onToggle: () => toggle(typeKey),
        });
        if (typeExp) {
          for (const t of typeLabels) {
            rows.push({
              key: `${typeKey}-${t}`, label: t, metric: m.label, rowName: `${segment} Type ${t}`,
              indent: 3, expandable: false, expanded: false,
            });
          }
        }

        // By Package
        const pkgKey = `${segKey}-Package`;
        const pkgExp = expanded.has(pkgKey);
        rows.push({
          key: pkgKey, label: 'By Package', metric: m.label, rowName: '',
          indent: 2, expandable: true, expanded: pkgExp, onToggle: () => toggle(pkgKey),
        });
        if (pkgExp) {
          for (const p of pkgLabels) {
            rows.push({
              key: `${pkgKey}-${p}`, label: p, metric: m.label, rowName: `${segment} Package ${p}`,
              indent: 3, expandable: false, expanded: false,
            });
          }
        }
      }
    } else {
      rows.push({ key: `${m.label}-Frozen`, label: 'Frozen', metric: m.label, rowName: 'Frozen', indent: 1, expandable: false, expanded: false });
      rows.push({ key: `${m.label}-FD`, label: 'FD', metric: m.label, rowName: 'FD', indent: 1, expandable: false, expanded: false });
    }
  }

  const indentClass = (indent: number) => {
    if (indent === 0) return 'pl-3';
    if (indent === 1) return 'pl-6';
    if (indent === 2) return 'pl-10';
    return 'pl-14';
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-report-header text-report-header-fg">
              <th className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10 text-left" rowSpan={2}>
                Consumption Metric
              </th>
              {quarters.map((q) => (
                <th key={q.label} className="report-header-cell border-x border-white/10 bg-report-input" colSpan={q.periods.length}>
                  {q.label}
                </th>
              ))}
            </tr>
            <tr className="bg-report-header/80 text-report-header-fg text-[10px]">
              {allPeriods.map((p) => (
                <th key={p} className="px-2 py-1 bg-report-input/60 border-x border-white/10 font-medium min-w-[70px]">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const periodData = row.rowName ? (data[row.metric]?.[row.rowName] ?? {}) : {};
              return (
                <tr
                  key={row.key}
                  className={`border-b border-border/50 transition-colors hover:bg-report-hover ${
                    row.indent === 0 ? 'bg-report-group/10 font-semibold'
                      : row.indent === 1 ? 'bg-muted/30'
                      : row.indent === 2 ? 'bg-muted/15 italic'
                      : ''
                  }`}
                >
                  <td className={`report-channel-cell sticky left-0 z-10 border-r border-border bg-card ${indentClass(row.indent)} ${
                    row.indent === 0 ? 'bg-report-group/10 font-bold text-[12px]' : 'text-[12px]'
                  }`}>
                    <button
                      className={`flex items-center gap-1 ${row.expandable ? 'cursor-pointer hover:text-primary' : 'cursor-default'}`}
                      onClick={row.onToggle}
                      disabled={!row.expandable}
                    >
                      {row.expandable && (
                        row.expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />
                      )}
                      <span>{row.label}</span>
                    </button>
                  </td>
                  {allPeriods.map((p) => {
                    const val = periodData[p];
                    return (
                      <td key={p} className={`report-data-cell ${row.indent === 0 ? 'bg-report-input-light font-semibold' : 'bg-report-input-light'}`}>
                        {val !== undefined ? formatVal(row.metric, val) : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
