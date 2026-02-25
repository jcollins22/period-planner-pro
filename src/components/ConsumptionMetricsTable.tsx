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
  drillable: boolean; // Sales/Velocity have 3-level hierarchy
}

const metrics: MetricDef[] = [
  { label: 'Sales', drillable: true },
  { label: 'Velocity', drillable: true },
  { label: 'HH Penetration', drillable: false },
  { label: 'Total Repeat Rate', drillable: false },
  { label: '$/Household', drillable: false },
];

const formatVal = (metric: string, v: number): string => {
  if (metric === 'Sales') return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'Velocity') return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'HH Penetration' || metric === 'Total Repeat Rate') return v.toFixed(1) + '%';
  if (metric === '$/Household') return '$' + v.toFixed(2);
  return String(v);
};

export default function ConsumptionMetricsTable() {
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const data = useMemo(() => generateConsumptionPeriodData('default'), []);

  const toggleMetric = useCallback((label: string) => {
    setExpandedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const toggleSub = useCallback((key: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Build rows
  const rows: {
    key: string;
    label: string;
    metric: string;
    rowName: string;
    indent: number;
    isParent: boolean;
    expandable: boolean;
    expanded: boolean;
    onToggle?: () => void;
  }[] = [];

  for (const m of metrics) {
    const isExpanded = expandedMetrics.has(m.label);
    rows.push({
      key: m.label,
      label: m.label,
      metric: m.label,
      rowName: 'Total',
      indent: 0,
      isParent: true,
      expandable: true,
      expanded: isExpanded,
      onToggle: () => toggleMetric(m.label),
    });

    if (isExpanded) {
      if (m.drillable) {
        // Frozen (expandable)
        const frozenKey = `${m.label}-Frozen`;
        const frozenExpanded = expandedSubs.has(frozenKey);
        rows.push({
          key: frozenKey,
          label: 'Frozen',
          metric: m.label,
          rowName: 'Frozen',
          indent: 1,
          isParent: true,
          expandable: true,
          expanded: frozenExpanded,
          onToggle: () => toggleSub(frozenKey),
        });
        if (frozenExpanded) {
          rows.push({
            key: `${m.label}-Frozen Core`,
            label: 'Core',
            metric: m.label,
            rowName: 'Frozen Core',
            indent: 2,
            isParent: false,
            expandable: false,
            expanded: false,
          });
          rows.push({
            key: `${m.label}-Frozen Greek`,
            label: 'Greek',
            metric: m.label,
            rowName: 'Frozen Greek',
            indent: 2,
            isParent: false,
            expandable: false,
            expanded: false,
          });
        }
        // FD (expandable)
        const fdKey = `${m.label}-FD`;
        const fdExpanded = expandedSubs.has(fdKey);
        rows.push({
          key: fdKey,
          label: 'FD',
          metric: m.label,
          rowName: 'FD',
          indent: 1,
          isParent: true,
          expandable: true,
          expanded: fdExpanded,
          onToggle: () => toggleSub(fdKey),
        });
        if (fdExpanded) {
          rows.push({
            key: `${m.label}-FD Core`,
            label: 'Core',
            metric: m.label,
            rowName: 'FD Core',
            indent: 2,
            isParent: false,
            expandable: false,
            expanded: false,
          });
          rows.push({
            key: `${m.label}-FD Creme`,
            label: 'Creme',
            metric: m.label,
            rowName: 'FD Creme',
            indent: 2,
            isParent: false,
            expandable: false,
            expanded: false,
          });
        }
      } else {
        // Non-drillable: just Frozen and FD
        rows.push({
          key: `${m.label}-Frozen`,
          label: 'Frozen',
          metric: m.label,
          rowName: 'Frozen',
          indent: 1,
          isParent: false,
          expandable: false,
          expanded: false,
        });
        rows.push({
          key: `${m.label}-FD`,
          label: 'FD',
          metric: m.label,
          rowName: 'FD',
          indent: 1,
          isParent: false,
          expandable: false,
          expanded: false,
        });
      }
    }
  }

  const indentClass = (indent: number) =>
    indent === 0 ? 'pl-3' : indent === 1 ? 'pl-6' : 'pl-10';

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-report-header text-report-header-fg">
              <th
                className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10 text-left"
                rowSpan={2}
              >
                Consumption Metric
              </th>
              {quarters.map((q) => (
                <th
                  key={q.label}
                  className="report-header-cell border-x border-white/10 bg-report-input"
                  colSpan={q.periods.length}
                >
                  {q.label}
                </th>
              ))}
            </tr>
            <tr className="bg-report-header/80 text-report-header-fg text-[10px]">
              {allPeriods.map((p) => (
                <th
                  key={p}
                  className="px-2 py-1 bg-report-input/60 border-x border-white/10 font-medium min-w-[70px]"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const periodData = data[row.metric]?.[row.rowName] ?? {};
              return (
                <tr
                  key={row.key}
                  className={`border-b border-border/50 transition-colors hover:bg-report-hover ${
                    row.indent === 0
                      ? 'bg-report-group/10 font-semibold'
                      : row.indent === 1
                      ? 'bg-muted/30'
                      : ''
                  }`}
                >
                  <td
                    className={`report-channel-cell sticky left-0 z-10 border-r border-border bg-card ${indentClass(
                      row.indent
                    )} ${row.indent === 0 ? 'bg-report-group/10 font-bold text-[12px]' : 'text-[12px]'}`}
                  >
                    <button
                      className={`flex items-center gap-1 ${
                        row.expandable ? 'cursor-pointer hover:text-primary' : 'cursor-default'
                      }`}
                      onClick={row.onToggle}
                      disabled={!row.expandable}
                    >
                      {row.expandable && (
                        row.expanded ? (
                          <ChevronDown size={14} className="shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="shrink-0" />
                        )
                      )}
                      <span>{row.label}</span>
                    </button>
                  </td>
                  {allPeriods.map((p) => {
                    const val = periodData[p];
                    return (
                      <td
                        key={p}
                        className={`report-data-cell ${
                          row.indent === 0 ? 'bg-report-input-light font-semibold' : 'bg-report-input-light'
                        }`}
                      >
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
