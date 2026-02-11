import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { generateReportData, type RowData } from '@/data/reportData';

interface ReportTableProps {
  period: string;
}

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

const qoqColor = (v?: number) => {
  if (v === undefined || v === null) return '';
  if (v > 0) return 'text-emerald-600';
  if (v < 0) return 'text-red-500';
  return '';
};

const inputCols = ['Planned Spend', 'Actual Spend', 'Working Spend', 'Impressions', 'Samples'];
const calcCols = ['CPM & CPP', 'Coverage Factor', 'NSV Number', 'MAC Number'];
const outputPairs = [
  '% Contribution', 'Volume', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI', 'Effectiveness',
];

export default function ReportTable({ period }: ReportTableProps) {
  const isQuarter = period.startsWith('Q');
  const data = useMemo(() => generateReportData(period), [period]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));

  const renderDataRow = (row: RowData, idx: number, indent: boolean) => {
    const vals: (number | undefined)[] = [
      row.plannedSpend, row.actualSpend, row.workingSpend, row.impressions, row.samples,
    ];
    const calcVals: (number | undefined)[] = [
      row.cpmCpp, row.coverageFactor, row.nsvNumber, row.macNumber,
    ];
    const outputVals: [number | undefined, number | undefined][] = [
      [row.pctContribCurrent, row.pctContribQoQ],
      [row.volumeCurrent, row.volumeQoQ],
      [row.scaledVolCurrent, row.scaledVolQoQ],
      [row.nsvDollarCurrent, row.nsvDollarQoQ],
      [row.gsvCurrent, row.gsvQoQ],
      [row.nsvRoiCurrent, row.nsvRoiQoQ],
      [row.macRoiCurrent, row.macRoiQoQ],
      [row.effectivenessCurrent, row.effectivenessQoQ],
    ];

    return (
      <tr key={`${row.channel}-${idx}`} className="hover:bg-report-hover border-b border-border/50 transition-colors">
        <td className="report-channel-cell sticky left-0 bg-card z-10 border-r border-border">
          {indent && <span className="inline-block w-4" />}
          {row.channel}
        </td>
        {vals.map((v, i) => (
          <td key={`in-${i}`} className="report-data-cell bg-report-input-light">
            {i === 0 || i === 1 || i === 2 ? formatDollar(v) : formatNum(v)}
          </td>
        ))}
        {isQuarter && calcVals.map((v, i) => (
          <td key={`calc-${i}`} className="report-data-cell bg-report-calc-light">
            {i === 2 || i === 3 ? formatDollar(v) : formatNum(v)}
          </td>
        ))}
        {isQuarter && outputVals.map(([cur, qoq], i) => (
          <>
            <td key={`out-c-${i}`} className="report-data-cell bg-report-output-light">
              {i === 0 ? formatPct(cur) : i === 3 || i === 4 ? formatDollar(cur) : formatNum(cur)}
            </td>
            <td key={`out-q-${i}`} className={`report-data-cell bg-report-output-light ${qoqColor(qoq)}`}>
              {formatPct(qoq)}
            </td>
          </>
        ))}
      </tr>
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            {/* Top header row - category groups */}
            <tr className="bg-report-header text-report-header-fg">
              <th className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10" rowSpan={3}>
                Channel
              </th>
              <th
                className="report-header-cell bg-report-input border-x border-white/10"
                colSpan={5}
              >
                Inputs
              </th>
              {isQuarter && (
                <th
                  className="report-header-cell bg-report-calc border-x border-white/10"
                  colSpan={4}
                >
                  Calculated / Reference
                </th>
              )}
              {isQuarter && (
                <th
                  className="report-header-cell bg-report-output border-x border-white/10"
                  colSpan={16}
                >
                  Outputs
                </th>
              )}
            </tr>
            {/* Sub header - column names */}
            <tr className="bg-report-header/90 text-report-header-fg">
              {inputCols.map((c) => (
                <th key={c} className="report-header-cell bg-report-input/80 border-x border-white/10" rowSpan={c === 'Planned Spend' ? 1 : 1}>
                  {c}
                </th>
              ))}
              {isQuarter && calcCols.map((c) => (
                <th key={c} className="report-header-cell bg-report-calc/80 border-x border-white/10">
                  {c}
                </th>
              ))}
              {isQuarter && outputPairs.map((c) => (
                <th key={c} className="report-header-cell bg-report-output/80 border-x border-white/10" colSpan={2}>
                  {c}
                </th>
              ))}
            </tr>
            {/* Sub-sub header - period labels + Current/QoQ */}
            <tr className="bg-report-header/70 text-report-header-fg text-[10px]">
              {inputCols.map((c) => (
                <th key={`p-${c}`} className="px-2 py-1 bg-report-input/60 border-x border-white/10 font-normal">
                  {period}
                </th>
              ))}
              {isQuarter && calcCols.map((c) => (
                <th key={`p-${c}`} className="px-2 py-1 bg-report-calc/60 border-x border-white/10 font-normal">
                  {period}
                </th>
              ))}
              {isQuarter && outputPairs.map((c) => (
                <>
                  <th key={`cur-${c}`} className="px-2 py-1 bg-report-output/60 border-x border-white/5 font-medium">
                    Current
                  </th>
                  <th key={`qoq-${c}`} className="px-2 py-1 bg-report-output/50 border-x border-white/5 font-medium">
                    QoQ
                  </th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((group) => {
              const isCollapsed = collapsed[group.name];
              const hasRows = group.rows.length > 0;

              return (
                <>
                  {/* Group header row */}
                  <tr
                    key={`g-${group.name}`}
                    className="bg-report-group text-report-header-fg cursor-pointer select-none hover:bg-report-group/90 transition-colors"
                    onClick={() => hasRows && group.collapsible && toggle(group.name)}
                  >
                    <td
                      className="report-channel-cell sticky left-0 z-10 bg-report-group font-bold text-[12px] border-r border-white/10"
                      colSpan={1 + inputCols.length + (isQuarter ? calcCols.length + outputPairs.length * 2 : 0)}
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
                  {/* Data rows */}
                  {!isCollapsed && group.rows.map((row, idx) => renderDataRow(row, idx, true))}
                </>
              );
            })}
            {/* Total row */}
            <tr className="bg-report-total font-bold border-t-2 border-primary">
              <td className="report-channel-cell sticky left-0 z-10 bg-report-total border-r border-border">
                Total
              </td>
              {inputCols.map((_, i) => (
                <td key={`t-${i}`} className="report-data-cell bg-report-total">—</td>
              ))}
              {isQuarter && calcCols.map((_, i) => (
                <td key={`tc-${i}`} className="report-data-cell bg-report-total">—</td>
              ))}
              {isQuarter && outputPairs.map((_, i) => (
                <>
                  <td key={`to-c-${i}`} className="report-data-cell bg-report-total">—</td>
                  <td key={`to-q-${i}`} className="report-data-cell bg-report-total">—</td>
                </>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
