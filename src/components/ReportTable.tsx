import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { generateReportData, type RowData } from '@/data/reportData';
import type { TrendMode } from '@/components/PeriodSelector';

interface ReportTableProps {
  period: string;
  visibleInputs: string[];
  visibleCalcs: string[];
  visibleOutputs: string[];
  trendMode: TrendMode;
}

const allInputCols = ['Planned Spend', 'Actual Spend', 'Working Spend', 'Impressions', 'Samples'];
const allCalcCols = ['CPM & CPP', 'Coverage Factor', 'NSV Number', 'MAC Number'];
const allOutputPairs = [
  '% Contribution', 'Volume', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI', 'Effectiveness',
];

const formatNum = (v?: number) => {
  if (v === undefined || v === null) return '—';
  if (Math.abs(v) >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatDollar = (v?: number) => {
  if (v === undefined || v === null) return '—';
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatPct = (v?: number) => {
  if (v === undefined || v === null) return '—';
  return v.toFixed(1) + '%';
};

const trendColor = (v?: number) => {
  if (v === undefined || v === null) return '';
  if (v > 0) return 'text-emerald-600';
  if (v < 0) return 'text-red-500';
  return '';
};

// Map input column names to RowData keys
const inputKeyMap: Record<string, (r: RowData) => number | undefined> = {
  'Planned Spend': (r) => r.plannedSpend,
  'Actual Spend': (r) => r.actualSpend,
  'Working Spend': (r) => r.workingSpend,
  'Impressions': (r) => r.impressions,
  'Samples': (r) => r.samples,
};

const inputTrendMap: Record<string, (r: RowData) => number | undefined> = {
  'Planned Spend': (r) => r.plannedSpendTrend,
  'Actual Spend': (r) => r.actualSpendTrend,
  'Working Spend': (r) => r.workingSpendTrend,
  'Impressions': (r) => r.impressionsTrend,
  'Samples': (r) => r.samplesTrend,
};

const calcKeyMap: Record<string, (r: RowData) => number | undefined> = {
  'CPM & CPP': (r) => r.cpmCpp,
  'Coverage Factor': (r) => r.coverageFactor,
  'NSV Number': (r) => r.nsvNumber,
  'MAC Number': (r) => r.macNumber,
};

const calcTrendMap: Record<string, (r: RowData) => number | undefined> = {
  'CPM & CPP': (r) => r.cpmCppTrend,
  'Coverage Factor': (r) => r.coverageFactorTrend,
  'NSV Number': (r) => r.nsvNumberTrend,
  'MAC Number': (r) => r.macNumberTrend,
};

const outputCurrentMap: Record<string, (r: RowData) => number | undefined> = {
  '% Contribution': (r) => r.pctContribCurrent,
  'Volume': (r) => r.volumeCurrent,
  'Scaled Volume': (r) => r.scaledVolCurrent,
  'NSV $': (r) => r.nsvDollarCurrent,
  'GSV': (r) => r.gsvCurrent,
  'NSV ROI': (r) => r.nsvRoiCurrent,
  'MAC ROI': (r) => r.macRoiCurrent,
  'Effectiveness': (r) => r.effectivenessCurrent,
};

const outputTrendMap: Record<string, (r: RowData) => number | undefined> = {
  '% Contribution': (r) => r.pctContribQoQ,
  'Volume': (r) => r.volumeQoQ,
  'Scaled Volume': (r) => r.scaledVolQoQ,
  'NSV $': (r) => r.nsvDollarQoQ,
  'GSV': (r) => r.gsvQoQ,
  'NSV ROI': (r) => r.nsvRoiQoQ,
  'MAC ROI': (r) => r.macRoiQoQ,
  'Effectiveness': (r) => r.effectivenessQoQ,
};

const dollarInputs = new Set(['Planned Spend', 'Actual Spend', 'Working Spend']);
const dollarCalcs = new Set(['NSV Number', 'MAC Number']);
const pctOutputs = new Set(['% Contribution']);
const dollarOutputs = new Set(['NSV $', 'GSV']);

export default function ReportTable({ period, visibleInputs, visibleCalcs, visibleOutputs, trendMode }: ReportTableProps) {
  const isQuarter = period.startsWith('Q');
  const data = useMemo(() => generateReportData(period), [period]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const showTrend = trendMode !== 'none';
  const trendLabel = trendMode === 'none' ? '' : trendMode;

  const filteredInputs = allInputCols.filter((c) => visibleInputs.includes(c));
  const filteredCalcs = isQuarter ? allCalcCols.filter((c) => visibleCalcs.includes(c)) : [];
  const filteredOutputs = isQuarter ? allOutputPairs.filter((c) => visibleOutputs.includes(c)) : [];

  const colMultiplier = showTrend ? 2 : 1;
  const totalDataCols = filteredInputs.length * colMultiplier
    + filteredCalcs.length * colMultiplier
    + filteredOutputs.length * colMultiplier;

  const toggle = (name: string) =>
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));

  const renderDataRow = (row: RowData, idx: number, indent: boolean) => (
    <tr key={`${row.channel}-${idx}`} className="hover:bg-report-hover border-b border-border/50 transition-colors">
      <td className="report-channel-cell sticky left-0 bg-card z-10 border-r border-border">
        {indent && <span className="inline-block w-4" />}
        {row.channel}
      </td>
      {filteredInputs.map((col) => {
        const v = inputKeyMap[col](row);
        const trend = inputTrendMap[col](row);
        return (
          <React.Fragment key={`in-${col}`}>
            <td className="report-data-cell bg-report-input-light">
              {dollarInputs.has(col) ? formatDollar(v) : formatNum(v)}
            </td>
            {showTrend && (
              <td className={`report-data-cell bg-report-input-light ${trendColor(trend)}`}>
                {formatPct(trend)}
              </td>
            )}
          </React.Fragment>
        );
      })}
      {filteredCalcs.map((col) => {
        const v = calcKeyMap[col](row);
        const trend = calcTrendMap[col](row);
        return (
          <React.Fragment key={`calc-${col}`}>
            <td className="report-data-cell bg-report-calc-light">
              {dollarCalcs.has(col) ? formatDollar(v) : formatNum(v)}
            </td>
            {showTrend && (
              <td className={`report-data-cell bg-report-calc-light ${trendColor(trend)}`}>
                {formatPct(trend)}
              </td>
            )}
          </React.Fragment>
        );
      })}
      {filteredOutputs.map((col) => {
        const cur = outputCurrentMap[col](row);
        const trend = outputTrendMap[col](row);
        return (
          <React.Fragment key={`out-${col}`}>
            <td className="report-data-cell bg-report-output-light">
              {pctOutputs.has(col) ? formatPct(cur) : dollarOutputs.has(col) ? formatDollar(cur) : formatNum(cur)}
            </td>
            {showTrend && (
              <td className={`report-data-cell bg-report-output-light ${trendColor(trend)}`}>
                {formatPct(trend)}
              </td>
            )}
          </React.Fragment>
        );
      })}
    </tr>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-report-header text-report-header-fg">
              <th className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10" rowSpan={3}>
                Channel
              </th>
              {filteredInputs.length > 0 && (
                <th className="report-header-cell bg-report-input border-x border-white/10" colSpan={filteredInputs.length * colMultiplier}>
                  Inputs
                </th>
              )}
              {filteredCalcs.length > 0 && (
                <th className="report-header-cell bg-report-calc border-x border-white/10" colSpan={filteredCalcs.length * colMultiplier}>
                  Calculated / Reference
                </th>
              )}
              {filteredOutputs.length > 0 && (
                <th className="report-header-cell bg-report-output border-x border-white/10" colSpan={filteredOutputs.length * colMultiplier}>
                  Outputs
                </th>
              )}
            </tr>
            <tr className="bg-report-header/90 text-report-header-fg">
              {filteredInputs.map((c) => (
                <th key={c} className="report-header-cell bg-report-input/80 border-x border-white/10" colSpan={colMultiplier}>{c}</th>
              ))}
              {filteredCalcs.map((c) => (
                <th key={c} className="report-header-cell bg-report-calc/80 border-x border-white/10" colSpan={colMultiplier}>{c}</th>
              ))}
              {filteredOutputs.map((c) => (
                <th key={c} className="report-header-cell bg-report-output/80 border-x border-white/10" colSpan={colMultiplier}>{c}</th>
              ))}
            </tr>
            <tr className="bg-report-header/70 text-report-header-fg text-[10px]">
              {filteredInputs.map((c) => (
                <React.Fragment key={`sub-${c}`}>
                  <th className="px-2 py-1 bg-report-input/60 border-x border-white/10 font-normal">{period}</th>
                  {showTrend && (
                    <th className="px-2 py-1 bg-report-input/50 border-x border-white/5 font-medium">{trendLabel}</th>
                  )}
                </React.Fragment>
              ))}
              {filteredCalcs.map((c) => (
                <React.Fragment key={`sub-${c}`}>
                  <th className="px-2 py-1 bg-report-calc/60 border-x border-white/10 font-normal">{period}</th>
                  {showTrend && (
                    <th className="px-2 py-1 bg-report-calc/50 border-x border-white/5 font-medium">{trendLabel}</th>
                  )}
                </React.Fragment>
              ))}
              {filteredOutputs.map((c) => (
                <React.Fragment key={`sub-${c}`}>
                  <th className="px-2 py-1 bg-report-output/60 border-x border-white/5 font-medium">Current</th>
                  {showTrend && (
                    <th className="px-2 py-1 bg-report-output/50 border-x border-white/5 font-medium">{trendLabel}</th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((group) => {
              const isCollapsed = collapsed[group.name];
              const hasRows = group.rows.length > 0;

              return (
                <React.Fragment key={`g-${group.name}`}>
                  <tr
                    className="bg-report-group text-report-header-fg cursor-pointer select-none hover:bg-report-group/90 transition-colors"
                    onClick={() => hasRows && group.collapsible && toggle(group.name)}
                  >
                    <td
                      className="report-channel-cell sticky left-0 z-10 bg-report-group font-bold text-[12px] border-r border-white/10"
                      colSpan={1 + totalDataCols}
                    >
                      <div className="flex items-center gap-1.5">
                        {hasRows && group.collapsible && (
                          isCollapsed
                            ? <ChevronRight className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                        {group.name}
                      </div>
                    </td>
                  </tr>
                  {!isCollapsed && group.rows.map((row, idx) => renderDataRow(row, idx, true))}
                </React.Fragment>
              );
            })}
            <tr className="bg-report-total font-bold border-t-2 border-primary">
              <td className="report-channel-cell sticky left-0 z-10 bg-report-total border-r border-border">Total</td>
              {Array.from({ length: totalDataCols }).map((_, i) => (
                <td key={`t-${i}`} className="report-data-cell bg-report-total">—</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
