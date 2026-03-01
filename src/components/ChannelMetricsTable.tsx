import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  outputMetrics,
  channelGroups,
  quarterPeriods,
  generateChannelMetricsData,
  type OutputMetric,
} from '@/data/channelMetricsData';
import { generateConsumptionPeriodData } from '@/data/consumptionData';

const allPeriods = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);
const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'P13'] as const;

const formatVal = (metric: string, v: number) => {
  if (metric === 'Working Spend' || metric === 'GSV' || metric === 'NSV')
    return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'Impressions' || metric === 'Samples')
    return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'Volume %') return v.toFixed(1) + '%';
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatOutputVal = (outputMetric: OutputMetric, v: number) => {
  if (outputMetric === 'GSV' || outputMetric === 'NSV')
    return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (outputMetric === 'Volume %') return v.toFixed(1) + '%';
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatConsumptionVal = (metric: string, v: number): string => {
  if (metric === 'Sales') return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'Velocity') return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (metric === 'HH Penetration' || metric === 'Total Repeat Rate') return v.toFixed(1) + '%';
  if (metric === '$/Household') return '$' + v.toFixed(2);
  return String(v);
};

interface ConsumptionMetricDef {
  label: string;
  drillable: boolean;
}

const consumptionMetrics: ConsumptionMetricDef[] = [
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

interface ChannelMetricsTableProps {
  channelData?: Record<string, Record<string, Record<string, number>>>;
  consumptionPeriodData?: Record<string, Record<string, Record<string, number>>>;
}

export default function ChannelMetricsTable({ channelData, consumptionPeriodData }: ChannelMetricsTableProps = {}) {
  const [selectedMetric, setSelectedMetric] = useState<OutputMetric>('NSV ROI');
  const data = useMemo(() => channelData ?? generateChannelMetricsData(selectedMetric), [channelData, selectedMetric]);
  const consumptionData = useMemo(() => consumptionPeriodData ?? generateConsumptionPeriodData('default'), [consumptionPeriodData]);

  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const toggleMetric = useCallback((label: string) => {
    setExpandedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  const toggleSub = useCallback((key: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // Build consumption rows
  const consumptionRows: {
    key: string;
    label: string;
    metric: string;
    rowName: string;
    indent: number;
    expandable: boolean;
    expanded: boolean;
    onToggle?: () => void;
  }[] = [];

  for (const m of consumptionMetrics) {
    const isExpanded = expandedMetrics.has(m.label);
    consumptionRows.push({
      key: m.label,
      label: m.label,
      metric: m.label,
      rowName: 'Total',
      indent: 0,
      expandable: true,
      expanded: isExpanded,
      onToggle: () => toggleMetric(m.label),
    });

    if (isExpanded) {
      if (m.drillable) {
        for (const segment of ['Frozen', 'FD'] as const) {
          const segKey = `${m.label}-${segment}`;
          const segExpanded = expandedSubs.has(segKey);
          consumptionRows.push({
            key: segKey, label: segment, metric: m.label, rowName: segment,
            indent: 1, expandable: true, expanded: segExpanded, onToggle: () => toggleSub(segKey),
          });
          if (segExpanded) {
            const typeLabels = segment === 'Frozen' ? FROZEN_TYPES : FD_TYPES;
            const pkgLabels = segment === 'Frozen' ? FROZEN_PACKAGES : FD_PACKAGES;

            const typeKey = `${segKey}-Type`;
            const typeExp = expandedSubs.has(typeKey);
            consumptionRows.push({
              key: typeKey, label: 'By Type', metric: m.label, rowName: '',
              indent: 2, expandable: true, expanded: typeExp, onToggle: () => toggleSub(typeKey),
            });
            if (typeExp) {
              for (const t of typeLabels) {
                consumptionRows.push({
                  key: `${typeKey}-${t}`, label: t, metric: m.label, rowName: `${segment} Type ${t}`,
                  indent: 3, expandable: false, expanded: false,
                });
              }
            }

            const pkgKey = `${segKey}-Package`;
            const pkgExp = expandedSubs.has(pkgKey);
            consumptionRows.push({
              key: pkgKey, label: 'By Package', metric: m.label, rowName: '',
              indent: 2, expandable: true, expanded: pkgExp, onToggle: () => toggleSub(pkgKey),
            });
            if (pkgExp) {
              for (const p of pkgLabels) {
                consumptionRows.push({
                  key: `${pkgKey}-${p}`, label: p, metric: m.label, rowName: `${segment} Package ${p}`,
                  indent: 3, expandable: false, expanded: false,
                });
              }
            }
          }
        }
      } else {
        consumptionRows.push({ key: `${m.label}-Frozen`, label: 'Frozen', metric: m.label, rowName: 'Frozen', indent: 1, expandable: false, expanded: false });
        consumptionRows.push({ key: `${m.label}-FD`, label: 'FD', metric: m.label, rowName: 'FD', indent: 1, expandable: false, expanded: false });
      }
    }
  }

  // Count consumption rows that belong to each top-level metric (for rowSpan on "Consumption" group cell)
  const totalConsumptionRows = consumptionRows.length;

  const indentClass = (indent: number) => {
    if (indent === 0) return 'pl-3';
    if (indent === 1) return 'pl-6';
    if (indent === 2) return 'pl-10';
    return 'pl-14';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Output Metric
        </label>
        <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as OutputMetric)}>
          <SelectTrigger className="w-[180px] h-8 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {outputMetrics.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-report-header text-report-header-fg">
                <th className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10" rowSpan={2}>
                  Section
                </th>
                <th className="report-header-cell sticky left-[100px] z-20 bg-report-header border-r border-white/10" rowSpan={2}>
                  Metrics
                </th>
                {quarters.map((q) => (
                  <th key={q} className="report-header-cell border-x border-white/10 bg-report-input" colSpan={quarterPeriods[q].length}>
                    {q}
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
              {/* Channel groups */}
              {channelGroups.map((group) => (
                group.metrics.map((metric, mIdx) => {
                  const isOutputMetric = metric === 'Output Metric';
                  const displayMetric = isOutputMetric ? selectedMetric : metric;
                  const periodData = data[group.name]?.[metric] ?? {};

                  return (
                    <tr
                      key={`${group.name}-${metric}`}
                      className={`hover:bg-report-hover border-b border-border/50 transition-colors ${isOutputMetric ? 'bg-report-output-light' : ''}`}
                    >
                      {mIdx === 0 && (
                        <td
                          className="report-channel-cell sticky left-0 bg-report-group text-report-header-fg z-10 border-r border-white/10 font-bold text-[12px]"
                          rowSpan={group.metrics.length}
                        >
                          {group.name}
                        </td>
                      )}
                      <td className={`report-channel-cell sticky left-[100px] z-10 border-r border-border font-medium text-[12px] ${isOutputMetric ? 'bg-report-output-light text-primary font-semibold' : 'bg-card'}`}>
                        {displayMetric}
                      </td>
                      {isOutputMetric ? (
                        <>
                          {quarters.map((q) => {
                            const val = periodData[q];
                            const trend = periodData[`${q}_trend`];
                            const span = quarterPeriods[q].length;
                            return (
                              <td key={q} colSpan={span} className="report-data-cell bg-report-output-light text-center border-2 border-primary/40">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>{val !== undefined ? formatOutputVal(selectedMetric, val) : '—'}</span>
                                  {trend !== undefined && (
                                    <span className={`text-[10px] font-medium ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : ''}`}>
                                      {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </>
                      ) : (
                        allPeriods.map((p) => {
                          const val = periodData[p];
                          return (
                            <td key={p} className="report-data-cell bg-report-input-light">
                              {val !== undefined ? formatVal(metric, val) : '—'}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })
              ))}

              {/* Separator row */}
              <tr className="bg-report-header/60">
                <td colSpan={2 + allPeriods.length} className="h-1" />
              </tr>

              {/* Consumption metrics rows */}
              {consumptionRows.map((row, idx) => {
                const periodData = consumptionData[row.metric]?.[row.rowName] ?? {};
                return (
                  <tr
                    key={`consumption-${row.key}`}
                    className={`border-b border-border/50 transition-colors hover:bg-report-hover ${
                      row.indent === 0 ? 'bg-report-group/10 font-semibold' : row.indent === 1 ? 'bg-muted/30' : row.indent === 2 ? 'bg-muted/15 italic' : ''
                    }`}
                  >
                    {idx === 0 && (
                      <td
                        className="report-channel-cell sticky left-0 bg-report-group text-report-header-fg z-10 border-r border-white/10 font-bold text-[12px] align-top"
                        rowSpan={totalConsumptionRows}
                      >
                        Consumption
                      </td>
                    )}
                    <td
                      className={`report-channel-cell sticky left-[100px] z-10 border-r border-border bg-card ${indentClass(row.indent)} ${
                        row.indent === 0 ? 'font-bold text-[12px]' : 'text-[12px]'
                      }`}
                    >
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
                          {val !== undefined ? formatConsumptionVal(row.metric, val) : '—'}
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
    </div>
  );
}
