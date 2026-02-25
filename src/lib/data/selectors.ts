import type { ParsedWorkbook, QuarterRow } from '@/lib/excel/excelSchema';
import type { RowData, RowGroup } from '@/data/reportData';
import { generateReportData } from '@/data/reportData';
import type { ConsumptionTileData } from '@/data/consumptionData';
import { generateConsumptionData, generateConsumptionPeriodData, type ConsumptionPeriodData } from '@/data/consumptionData';
import type { ChannelMetricsMap, OutputMetric } from '@/data/channelMetricsData';
import { generateChannelMetricsData, channelGroups } from '@/data/channelMetricsData';

// ── Mapping: Excel column names → RowData field keys ──

// The Excel Q sheets have columns like "Planned Spend__Q" and "Planned Spend__QoQ"
// We need to map these to RowData fields like plannedSpend and plannedSpendTrend

const excelToRowDataMap: Record<string, { value: keyof RowData; trend: keyof RowData }> = {
  'Planned Spend': { value: 'plannedSpend', trend: 'plannedSpendTrend' },
  'Actual Spend': { value: 'actualSpend', trend: 'actualSpendTrend' },
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

// Channel → group assignment
const channelGroupMap: Record<string, string> = {};
const defaultGroups: Record<string, string[]> = {
  'Base': ['Other Base Features', 'Competitor Average Price', 'Competitor TDP', 'Inflation', 'Seasonality', 'Temperature', 'Average Price', 'Change of TDP', 'Trade (Feature & Display)', 'Promo'],
  'Social': ['Owned + Paid', 'In-house Influencers', 'PR Box', 'Adfairy', 'Kale', 'New Social Channel', 'Essential Spend - Non Working'],
  'Experiential Marketing': ['Samples At/Near Store', 'Samples Away from Store', 'Samples at Event'],
  'Shopper Marketing': ['Shopper Tactic 1', 'Shopper Tactic 2', 'Shopper Tactic 3'],
};

for (const [group, channels] of Object.entries(defaultGroups)) {
  for (const ch of channels) channelGroupMap[ch] = group;
}

function quarterRowToRowData(row: QuarterRow): RowData {
  const rd: RowData = { channel: row.channel };

  // Extract unique metric names from keys like "Metric Name__Q"
  for (const key of Object.keys(row)) {
    if (key === 'channel') continue;
    const parts = key.split('__');
    if (parts.length !== 2) continue;
    const [metricName, subHeader] = parts;
    const mapping = excelToRowDataMap[metricName];
    if (!mapping) continue;

    const val = row[key];
    const numVal = typeof val === 'number' ? val : Number(val) || 0;

    if (subHeader === 'Q') {
      (rd as any)[mapping.value] = numVal;
    } else if (subHeader === 'QoQ') {
      (rd as any)[mapping.trend] = numVal;
    }
  }

  return rd;
}

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
    actualSpend: sum(r => r.actualSpend), actualSpendTrend: avg(r => r.actualSpendTrend),
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

// ── Report Data Selector ──

export function selectReportData(workbook: ParsedWorkbook | null, period: string, trendMode: string): RowGroup[] {
  if (!workbook) return generateReportData(period, trendMode);

  const qKey = period.startsWith('Q') ? period.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' : null;

  // For period selections (P1-P13), map to the corresponding quarter
  let rows: QuarterRow[];
  if (qKey) {
    rows = workbook[qKey];
  } else {
    // For Px periods, find which quarter it belongs to
    const pNum = parseInt(period.slice(1));
    const q = pNum <= 3 ? 'q1' : pNum <= 6 ? 'q2' : pNum <= 9 ? 'q3' : pNum <= 12 ? 'q4' : 'q4';
    rows = workbook[q];
  }

  if (!rows || rows.length === 0) return generateReportData(period, trendMode);

  // Group channels
  const groupedRows: Record<string, RowData[]> = {};
  for (const row of rows) {
    const rd = quarterRowToRowData(row);
    const groupName = channelGroupMap[rd.channel] || 'Other';
    if (!groupedRows[groupName]) groupedRows[groupName] = [];
    groupedRows[groupName].push(rd);
  }

  const groupOrder = ['Base', 'Social', 'Experiential Marketing', 'Shopper Marketing'];
  const result: RowGroup[] = [];

  for (const name of groupOrder) {
    const gRows = groupedRows[name] || [];
    if (gRows.length === 0) continue;
    result.push({
      name,
      collapsible: true,
      rows: gRows,
      totals: computeTotals(gRows),
    });
  }

  // Add any remaining groups not in the order
  for (const [name, gRows] of Object.entries(groupedRows)) {
    if (!groupOrder.includes(name)) {
      result.push({ name, collapsible: true, rows: gRows, totals: computeTotals(gRows) });
    }
  }

  return result;
}

// ── Consumption Tiles Selector ──

const quarterPeriodMap: Record<string, string[]> = {
  Q1: ['P1', 'P2', 'P3'],
  Q2: ['P4', 'P5', 'P6'],
  Q3: ['P7', 'P8', 'P9'],
  Q4: ['P10', 'P11', 'P12'],
};

export function selectConsumptionTiles(workbook: ParsedWorkbook | null, period: string, trendMode: string): ConsumptionTileData[] {
  if (!workbook || workbook.consumption.length === 0) return generateConsumptionData(period, trendMode);

  const periodsToSum = period.startsWith('Q') ? (quarterPeriodMap[period] || [period]) : [period];

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

    const sumPeriods = (r: typeof rows[0]) =>
      periodsToSum.reduce((acc, p) => acc + (typeof r[p] === 'number' ? r[p] as number : 0), 0);

    const totalRow = rows.find(r => r.level1 === 'Total');
    const frozenRow = rows.find(r => r.level1 === 'Frozen' && !r.level2);
    const fdRow = rows.find(r => r.level1 === 'FD' && !r.level2);

    const total = totalRow ? sumPeriods(totalRow) : 0;
    const frozen = frozenRow ? sumPeriods(frozenRow) : 0;
    const fd = fdRow ? sumPeriods(fdRow) : 0;

    const tile: ConsumptionTileData = {
      label,
      total,
      trend: 0,
      frozen,
      frozenTrend: 0,
      fd,
      fdTrend: 0,
      drillable,
    };

    if (drillable) {
      const frozenCoreRow = rows.find(r => r.level1 === 'Frozen' && r.level2 === 'Core');
      const frozenGreekRow = rows.find(r => r.level1 === 'Frozen' && r.level2 === 'Greek');
      const fdCoreRow = rows.find(r => r.level1 === 'FD' && r.level2 === 'Core');
      const fdCremeRow = rows.find(r => r.level1 === 'FD' && r.level2 === 'Creme');

      tile.frozenCore = { value: frozenCoreRow ? sumPeriods(frozenCoreRow) : 0, trend: 0 };
      tile.frozenGreek = { value: frozenGreekRow ? sumPeriods(frozenGreekRow) : 0, trend: 0 };
      tile.fdCore = { value: fdCoreRow ? sumPeriods(fdCoreRow) : 0, trend: 0 };
      tile.fdCreme = { value: fdCremeRow ? sumPeriods(fdCremeRow) : 0, trend: 0 };
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

    // Determine row name from level1/level2
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

export function selectChannelMetricsData(workbook: ParsedWorkbook | null, outputMetric: OutputMetric): ChannelMetricsMap {
  if (!workbook || workbook.period.length === 0) return generateChannelMetricsData(outputMetric);

  const result: ChannelMetricsMap = {};

  // Map period rows into channel metrics structure
  // The existing structure is: channelGroupName -> metricName -> periodKey -> value
  // Period sheet has: channel (group name), metric, P1..P13

  for (const row of workbook.period) {
    const groupName = row.channel;
    if (!result[groupName]) result[groupName] = {};

    let metricKey = row.metric;
    // If metric matches the selected output metric, store as 'Output Metric'
    if (metricKey === outputMetric) metricKey = 'Output Metric';

    if (!result[groupName][metricKey]) result[groupName][metricKey] = {};

    for (let i = 1; i <= 13; i++) {
      const p = `P${i}`;
      const val = row[p];
      result[groupName][metricKey][p] = typeof val === 'number' ? val : Number(val) || 0;
    }
  }

  return result;
}
