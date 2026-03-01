import type { ParsedWorkbook, ChannelRow } from '@/lib/excel/excelSchema';
import type { RowData, RowGroup } from '@/data/reportData';
import { generateReportData } from '@/data/reportData';
import type { ConsumptionTileData } from '@/data/consumptionData';
import { generateConsumptionData, generateConsumptionPeriodData, type ConsumptionPeriodData } from '@/data/consumptionData';
import type { ChannelMetricsMap, OutputMetric } from '@/data/channelMetricsData';
import { generateChannelMetricsData } from '@/data/channelMetricsData';

// ── Helpers ──

const quarterPeriodMap: Record<string, string[]> = {
  Q1: ['P1', 'P2', 'P3'],
  Q2: ['P4', 'P5', 'P6'],
  Q3: ['P7', 'P8', 'P9'],
  Q4: ['P10', 'P11', 'P12'],
};

const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];

function computeTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number(((current - previous) / Math.abs(previous) * 100).toFixed(1));
}

function sumPeriods(row: ChannelRow, periods: string[]): number {
  return periods.reduce((acc, p) => acc + (typeof row[p] === 'number' ? row[p] as number : 0), 0);
}

function getPreviousQuarter(q: string): string | null {
  const idx = quarterOrder.indexOf(q);
  return idx > 0 ? quarterOrder[idx - 1] : null;
}

function getPreviousPeriod(p: string): string | null {
  const num = parseInt(p.slice(1));
  return num > 1 ? `P${num - 1}` : null;
}

// ── Metric name → RowData field mapping ──

const metricFieldMap: Record<string, { value: keyof RowData; trend: keyof RowData }> = {
  'Planned Spend': { value: 'plannedSpend', trend: 'plannedSpendTrend' },
  'Essential Spend (non working)': { value: 'essentialSpend', trend: 'essentialSpendTrend' },
  'Working Spend': { value: 'workingSpend', trend: 'workingSpendTrend' },
  'Impressions': { value: 'impressions', trend: 'impressionsTrend' },
  'Samples': { value: 'samples', trend: 'samplesTrend' },
  'CPM & CPP': { value: 'cpmCpp', trend: 'cpmCppTrend' },
  'Coverage Factor': { value: 'coverageFactor', trend: 'coverageFactorTrend' },
  'NSV Number': { value: 'nsvNumber', trend: 'nsvNumberTrend' },
  'MAC Number': { value: 'macNumber', trend: 'macNumberTrend' },
  '% Contribution': { value: 'pctContribCurrent', trend: 'pctContribQoQ' },
  'Volume': { value: 'volumeCurrent', trend: 'volumeQoQ' },
  'Scaled Volume': { value: 'scaledVolCurrent', trend: 'scaledVolQoQ' },
  'NSV $': { value: 'nsvDollarCurrent', trend: 'nsvDollarQoQ' },
  'GSV': { value: 'gsvCurrent', trend: 'gsvQoQ' },
  'NSV ROI': { value: 'nsvRoiCurrent', trend: 'nsvRoiQoQ' },
  'MAC ROI': { value: 'macRoiCurrent', trend: 'macRoiQoQ' },
  'Effectiveness': { value: 'effectivenessCurrent', trend: 'effectivenessQoQ' },
};

// ── Report Data Selector ──

function computeTotals(rows: RowData[]): RowData {
  const sum = (fn: (r: RowData) => number | undefined) =>
    rows.reduce((acc, r) => acc + (fn(r) ?? 0), 0);
  const avg = (fn: (r: RowData) => number | undefined) => {
    const vals = rows.map(fn).filter((v): v is number => v !== undefined);
    return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : undefined;
  };

  return {
    channel: 'Total',
    plannedSpend: sum(r => r.plannedSpend), plannedSpendTrend: avg(r => r.plannedSpendTrend),
    essentialSpend: sum(r => r.essentialSpend), essentialSpendTrend: avg(r => r.essentialSpendTrend),
    workingSpend: sum(r => r.workingSpend), workingSpendTrend: avg(r => r.workingSpendTrend),
    impressions: sum(r => r.impressions), impressionsTrend: avg(r => r.impressionsTrend),
    samples: sum(r => r.samples), samplesTrend: avg(r => r.samplesTrend),
    cpmCpp: avg(r => r.cpmCpp), cpmCppTrend: avg(r => r.cpmCppTrend),
    coverageFactor: avg(r => r.coverageFactor), coverageFactorTrend: avg(r => r.coverageFactorTrend),
    nsvNumber: sum(r => r.nsvNumber), nsvNumberTrend: avg(r => r.nsvNumberTrend),
    macNumber: sum(r => r.macNumber), macNumberTrend: avg(r => r.macNumberTrend),
    pctContribCurrent: sum(r => r.pctContribCurrent), pctContribQoQ: avg(r => r.pctContribQoQ),
    volumeCurrent: sum(r => r.volumeCurrent), volumeQoQ: avg(r => r.volumeQoQ),
    scaledVolCurrent: sum(r => r.scaledVolCurrent), scaledVolQoQ: avg(r => r.scaledVolQoQ),
    nsvDollarCurrent: sum(r => r.nsvDollarCurrent), nsvDollarQoQ: avg(r => r.nsvDollarQoQ),
    gsvCurrent: sum(r => r.gsvCurrent), gsvQoQ: avg(r => r.gsvQoQ),
    nsvRoiCurrent: avg(r => r.nsvRoiCurrent), nsvRoiQoQ: avg(r => r.nsvRoiQoQ),
    macRoiCurrent: avg(r => r.macRoiCurrent), macRoiQoQ: avg(r => r.macRoiQoQ),
    effectivenessCurrent: avg(r => r.effectivenessCurrent), effectivenessQoQ: avg(r => r.effectivenessQoQ),
  };
}

export function selectReportData(workbook: ParsedWorkbook | null, period: string, trendMode: string): RowGroup[] {
  if (!workbook || workbook.channels.length === 0) return generateReportData(period, trendMode);

  const isQuarter = period.startsWith('Q');

  // Determine current and previous periods for value extraction and trend computation
  let currentPeriods: string[];
  let previousPeriods: string[] | null;

  if (isQuarter) {
    currentPeriods = quarterPeriodMap[period] || [];
    const prevQ = getPreviousQuarter(period);
    previousPeriods = prevQ ? quarterPeriodMap[prevQ] : null;
  } else {
    currentPeriods = [period];
    const prevP = getPreviousPeriod(period);
    previousPeriods = prevP ? [prevP] : null;
  }

  // Group channel rows by channel name, collecting all metric rows per channel
  const channelMetrics: Record<string, { group: string; metrics: Record<string, ChannelRow> }> = {};

  for (const row of workbook.channels) {
    const key = row.channel;
    if (!channelMetrics[key]) {
      channelMetrics[key] = { group: row.group, metrics: {} };
    }
    channelMetrics[key].metrics[row.metric] = row;
  }

  // Build RowData per channel
  const groupedRows: Record<string, RowData[]> = {};

  for (const [channelName, { group, metrics }] of Object.entries(channelMetrics)) {
    const rd: RowData = { channel: channelName };

    for (const [metricName, mapping] of Object.entries(metricFieldMap)) {
      const metricRow = metrics[metricName];
      if (!metricRow) continue;

      const currentVal = currentPeriods.reduce((acc, p) => acc + (typeof metricRow[p] === 'number' ? metricRow[p] as number : 0), 0);
      let trendVal = 0;

      if (previousPeriods) {
        const prevVal = previousPeriods.reduce((acc, p) => acc + (typeof metricRow[p] === 'number' ? metricRow[p] as number : 0), 0);
        trendVal = computeTrend(currentVal, prevVal);
      }

      // Quarter-only metrics: leave undefined when viewing a period
      const quarterOnlyFields = new Set(['pctContribCurrent', 'scaledVolCurrent', 'nsvDollarCurrent', 'gsvCurrent', 'nsvRoiCurrent', 'macRoiCurrent']);
      const isQuarterOnlyMetric = quarterOnlyFields.has(mapping.value as string);
      if (isQuarterOnlyMetric && !isQuarter) continue;

      (rd as any)[mapping.value] = currentVal;
      (rd as any)[mapping.trend] = trendVal;
    }

    if (!groupedRows[group]) groupedRows[group] = [];
    groupedRows[group].push(rd);
  }

  // Build result in a sensible order
  const groupOrder = ['Base', 'Social', 'Experiential Marketing', 'Shopper Marketing'];
  const result: RowGroup[] = [];

  for (const name of groupOrder) {
    const gRows = groupedRows[name];
    if (!gRows || gRows.length === 0) continue;
    result.push({ name, collapsible: true, rows: gRows, totals: computeTotals(gRows) });
  }

  // Add any remaining groups not in the default order
  for (const [name, gRows] of Object.entries(groupedRows)) {
    if (!groupOrder.includes(name)) {
      result.push({ name, collapsible: true, rows: gRows, totals: computeTotals(gRows) });
    }
  }

  return result;
}

// ── Consumption Tiles Selector ──

export function selectConsumptionTiles(workbook: ParsedWorkbook | null, period: string, trendMode: string): ConsumptionTileData[] {
  if (!workbook || workbook.consumption.length === 0) return generateConsumptionData(period, trendMode);

  const isQuarter = period.startsWith('Q');
  const currentPeriods = isQuarter ? (quarterPeriodMap[period] || [period]) : [period];

  let previousPeriods: string[] | null;
  if (isQuarter) {
    const prevQ = getPreviousQuarter(period);
    previousPeriods = prevQ ? quarterPeriodMap[prevQ] : null;
  } else {
    const prevP = getPreviousPeriod(period);
    previousPeriods = prevP ? [prevP] : null;
  }

  const sumP = (row: any, periods: string[]) =>
    periods.reduce((acc: number, p: string) => acc + (typeof row[p] === 'number' ? row[p] as number : 0), 0);

  const trendFor = (row: any) => {
    const cur = sumP(row, currentPeriods);
    if (!previousPeriods) return 0;
    const prev = sumP(row, previousPeriods);
    return computeTrend(cur, prev);
  };

  // Group rows by metric
  const byMetric: Record<string, typeof workbook.consumption> = {};
  for (const row of workbook.consumption) {
    if (!byMetric[row.metric]) byMetric[row.metric] = [];
    byMetric[row.metric].push(row);
  }

  const tiles: ConsumptionTileData[] = [];
  const metricLabels = ['Sales', 'Velocity', 'HH Penetration', 'Total Repeat Rate', '$/Household'];
  const drillableMetrics = new Set(['Sales', 'Velocity']);

  for (const label of metricLabels) {
    const rows = byMetric[label] || [];
    const drillable = drillableMetrics.has(label);

    const totalRow = rows.find(r => r.level1 === 'Total');
    const frozenRow = rows.find(r => r.level1 === 'Frozen' && !r.level2);
    const fdRow = rows.find(r => r.level1 === 'FD' && !r.level2);

    const tile: ConsumptionTileData = {
      label,
      total: totalRow ? sumP(totalRow, currentPeriods) : 0,
      trend: totalRow ? trendFor(totalRow) : 0,
      frozen: frozenRow ? sumP(frozenRow, currentPeriods) : 0,
      frozenTrend: frozenRow ? trendFor(frozenRow) : 0,
      fd: fdRow ? sumP(fdRow, currentPeriods) : 0,
      fdTrend: fdRow ? trendFor(fdRow) : 0,
      drillable,
    };

    if (drillable) {
      const frozenCoreRow = rows.find(r => r.level1 === 'Frozen' && r.level2 === 'Core');
      const frozenGreekRow = rows.find(r => r.level1 === 'Frozen' && r.level2 === 'Greek');
      const fdCoreRow = rows.find(r => r.level1 === 'FD' && r.level2 === 'Core');
      const fdCremeRow = rows.find(r => r.level1 === 'FD' && r.level2 === 'Creme');

      tile.frozenCore = { value: frozenCoreRow ? sumP(frozenCoreRow, currentPeriods) : 0, trend: frozenCoreRow ? trendFor(frozenCoreRow) : 0 };
      tile.frozenGreek = { value: frozenGreekRow ? sumP(frozenGreekRow, currentPeriods) : 0, trend: frozenGreekRow ? trendFor(frozenGreekRow) : 0 };
      tile.fdCore = { value: fdCoreRow ? sumP(fdCoreRow, currentPeriods) : 0, trend: fdCoreRow ? trendFor(fdCoreRow) : 0 };
      tile.fdCreme = { value: fdCremeRow ? sumP(fdCremeRow, currentPeriods) : 0, trend: fdCremeRow ? trendFor(fdCremeRow) : 0 };
    }

    tiles.push(tile);
  }

  return tiles;
}

// ── Consumption Period Data Selector ──

export function selectConsumptionPeriodData(workbook: ParsedWorkbook | null): ConsumptionPeriodData {
  if (!workbook || workbook.consumption.length === 0) return generateConsumptionPeriodData('default');

  const result: ConsumptionPeriodData = {};

  for (const row of workbook.consumption) {
    const metric = row.metric;
    if (!result[metric]) result[metric] = {};

    let rowName: string;
    if (row.level1 === 'Total') {
      rowName = 'Total';
    } else if (row.level2) {
      rowName = `${row.level1} ${row.level2}`;
    } else {
      rowName = row.level1;
    }

    if (!result[metric][rowName]) result[metric][rowName] = {};

    for (let i = 1; i <= 13; i++) {
      const p = `P${i}`;
      const val = row[p];
      result[metric][rowName][p] = typeof val === 'number' ? val : Number(val) || 0;
    }
  }

  return result;
}

// ── Channel Metrics Data Selector ──

const groupNameMap: Record<string, string> = {
  'Social': 'Social',
  'Shopper Marketing': 'Shopper',
  'Experiential Marketing': 'Experiential',
};

const channelMetricsGroups = new Set(['Social', 'Shopper Marketing', 'Experiential Marketing']);

// Map output metric dropdown values to channel sheet metric names
const outputMetricToChannelMetric: Record<string, string> = {
  'NSV ROI': 'NSV ROI',
  'Volume %': 'Volume',
  'GSV': 'GSV',
  'NSV': 'NSV $',
  'MAC ROI': 'MAC ROI',
};

export function selectChannelMetricsData(workbook: ParsedWorkbook | null, outputMetric: OutputMetric): ChannelMetricsMap {
  if (!workbook || workbook.channels.length === 0) return generateChannelMetricsData(outputMetric);

  const relevantMetrics = new Set(['Working Spend', 'Impressions', 'Samples']);
  const outputMetricName = outputMetricToChannelMetric[outputMetric] || outputMetric;

  // Aggregate channel rows by group and metric
  // groupDisplayName -> metricKey -> periodKey -> summed value
  const result: ChannelMetricsMap = {};

  for (const row of workbook.channels) {
    if (!channelMetricsGroups.has(row.group)) continue;

    const displayGroup = groupNameMap[row.group];
    const isOutputMetric = row.metric === outputMetricName;
    if (!relevantMetrics.has(row.metric) && !isOutputMetric) continue;

    const metricKey = isOutputMetric ? 'Output Metric' : row.metric;

    if (!result[displayGroup]) result[displayGroup] = {};
    if (!result[displayGroup][metricKey]) result[displayGroup][metricKey] = {};

    const target = result[displayGroup][metricKey];

    if (isOutputMetric) {
      // Aggregate into quarters
      for (const [q, periods] of Object.entries(quarterPeriodMap)) {
        const qVal = periods.reduce((acc, p) => acc + (typeof row[p] === 'number' ? row[p] as number : 0), 0);
        target[q] = (target[q] || 0) + qVal;
      }
    } else {
      // Per-period values
      for (let i = 1; i <= 13; i++) {
        const p = `P${i}`;
        const val = typeof row[p] === 'number' ? row[p] as number : 0;
        target[p] = (target[p] || 0) + val;
      }
    }
  }

  // Compute QoQ trends for output metrics
  const qOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
  for (const group of Object.values(result)) {
    const om = group['Output Metric'];
    if (!om) continue;
    for (let i = 0; i < qOrder.length; i++) {
      const q = qOrder[i];
      const prev = i > 0 ? om[qOrder[i - 1]] : undefined;
      if (prev !== undefined && prev !== 0) {
        om[`${q}_trend`] = Number(((om[q] - prev) / Math.abs(prev) * 100).toFixed(1));
      } else {
        om[`${q}_trend`] = 0;
      }
    }
  }

  return result;
}
