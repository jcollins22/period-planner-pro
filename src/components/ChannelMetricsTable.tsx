import { useState, useMemo } from 'react';
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

const allPeriods = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

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

export default function ChannelMetricsTable() {
  const [selectedMetric, setSelectedMetric] = useState<OutputMetric>('NSV ROI');
  const data = useMemo(() => generateChannelMetricsData(selectedMetric), [selectedMetric]);

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
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              {/* Top row: Channel | Metrics | Q1 ... Q4 spanning periods */}
              <tr className="bg-report-header text-report-header-fg">
                <th className="report-header-cell sticky left-0 z-20 bg-report-header border-r border-white/10" rowSpan={2}>
                  Channel
                </th>
                <th className="report-header-cell sticky left-[100px] z-20 bg-report-header border-r border-white/10" rowSpan={2}>
                  Metrics
                </th>
                {quarters.map((q) => (
                  <th
                    key={q}
                    className="report-header-cell border-x border-white/10 bg-report-input"
                    colSpan={quarterPeriods[q].length}
                  >
                    {q}
                  </th>
                ))}
              </tr>
              {/* Sub row: P1..P13 */}
              <tr className="bg-report-header/80 text-report-header-fg text-[10px]">
                {allPeriods.map((p) => (
                  <th key={p} className="px-2 py-1 bg-report-input/60 border-x border-white/10 font-medium min-w-[70px]">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channelGroups.map((group) => (
                group.metrics.map((metric, mIdx) => {
                  const isOutputMetric = metric === 'Output Metric';
                  const displayMetric = isOutputMetric ? selectedMetric : metric;
                  const periodData = data[group.name]?.[metric] ?? {};

                  return (
                    <tr
                      key={`${group.name}-${metric}`}
                      className={`hover:bg-report-hover border-b border-border/50 transition-colors ${
                        isOutputMetric ? 'bg-report-output-light' : ''
                      }`}
                    >
                      {mIdx === 0 && (
                        <td
                          className="report-channel-cell sticky left-0 bg-report-group text-report-header-fg z-10 border-r border-white/10 font-bold text-[12px]"
                          rowSpan={group.metrics.length}
                        >
                          {group.name}
                        </td>
                      )}
                      <td
                        className={`report-channel-cell sticky left-[100px] z-10 border-r border-border font-medium text-[12px] ${
                          isOutputMetric ? 'bg-report-output-light text-primary font-semibold' : 'bg-card'
                        }`}
                      >
                        {displayMetric}
                      </td>
                      {isOutputMetric ? (
                        // Render one merged cell per quarter, P13 blank
                        <>
                          {quarters.map((q) => {
                            const val = periodData[q];
                            const span = quarterPeriods[q].length;
                            return (
                              <td
                                key={q}
                                colSpan={span}
                                className="report-data-cell bg-report-output-light text-center"
                              >
                                {val !== undefined ? formatOutputVal(selectedMetric, val) : '—'}
                              </td>
                            );
                          })}
                        </>
                      ) : (
                        allPeriods.map((p) => {
                          const val = periodData[p];
                          return (
                            <td
                              key={p}
                              className="report-data-cell bg-report-input-light"
                            >
                              {val !== undefined ? formatVal(metric, val) : '—'}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
