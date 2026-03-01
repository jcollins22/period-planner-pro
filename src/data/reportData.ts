export type PeriodType = 'period' | 'quarter';

export const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'] as const;
export const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export interface RowData {
  channel: string;
  plannedSpend?: number;
  plannedSpendTrend?: number;
  essentialSpend?: number;
  essentialSpendTrend?: number;
  workingSpend?: number;
  workingSpendTrend?: number;
  impressions?: number;
  impressionsTrend?: number;
  samples?: number;
  samplesTrend?: number;
  cpmCpp?: number;
  cpmCppTrend?: number;
  coverageFactor?: number;
  coverageFactorTrend?: number;
  nsvNumber?: number;
  nsvNumberTrend?: number;
  macNumber?: number;
  macNumberTrend?: number;
  pctContribCurrent?: number;
  pctContribQoQ?: number;
  volumeCurrent?: number;
  volumeQoQ?: number;
  scaledVolCurrent?: number;
  scaledVolQoQ?: number;
  nsvDollarCurrent?: number;
  nsvDollarQoQ?: number;
  gsvCurrent?: number;
  gsvQoQ?: number;
  nsvRoiCurrent?: number;
  nsvRoiQoQ?: number;
  macRoiCurrent?: number;
  macRoiQoQ?: number;
  effectivenessCurrent?: number;
  effectivenessQoQ?: number;
}

export interface RowGroup {
  name: string;
  collapsible: boolean;
  rows: RowData[];
  totals: RowData;
}

function randomVal(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

type ExcludedMetricKey =
  | 'plannedSpend' | 'essentialSpend' | 'workingSpend'
  | 'impressions' | 'samples' | 'cpmCpp'
  | 'nsvRoi' | 'macRoi' | 'effectiveness';

const GROUP_EXCLUSIONS: Record<string, ExcludedMetricKey[]> = {
  Base: ['plannedSpend', 'essentialSpend', 'workingSpend', 'impressions', 'samples', 'cpmCpp', 'nsvRoi', 'macRoi', 'effectiveness'],
  Social: ['samples'],
  'Experiential Marketing': ['impressions', 'effectiveness'],
  'Shopper Marketing': ['impressions', 'samples', 'effectiveness'],
};

function generateRow(channel: string, isQuarter: boolean, excludes: ExcludedMetricKey[] = []): RowData {
  const ex = new Set(excludes);

  const base: RowData = {
    channel,
    plannedSpend: ex.has('plannedSpend') ? undefined : randomVal(5000, 200000),
    plannedSpendTrend: ex.has('plannedSpend') ? undefined : randomVal(-15, 15, 1),
    essentialSpend: ex.has('essentialSpend') ? undefined : randomVal(5000, 200000),
    essentialSpendTrend: ex.has('essentialSpend') ? undefined : randomVal(-15, 15, 1),
    workingSpend: ex.has('workingSpend') ? undefined : randomVal(3000, 150000),
    workingSpendTrend: ex.has('workingSpend') ? undefined : randomVal(-15, 15, 1),
    impressions: ex.has('impressions') ? undefined : randomVal(100000, 5000000),
    impressionsTrend: ex.has('impressions') ? undefined : randomVal(-15, 15, 1),
    samples: ex.has('samples') ? undefined : randomVal(0, 50000),
    samplesTrend: ex.has('samples') ? undefined : randomVal(-15, 15, 1),
    cpmCpp: ex.has('cpmCpp') ? undefined : randomVal(2, 25, 2),
    cpmCppTrend: ex.has('cpmCpp') ? undefined : randomVal(-15, 15, 1),
    coverageFactor: randomVal(0.1, 1, 2),
    coverageFactorTrend: randomVal(-15, 15, 1),
    nsvNumber: randomVal(100000, 2000000),
    nsvNumberTrend: randomVal(-15, 15, 1),
    macNumber: randomVal(50000, 1000000),
    macNumberTrend: randomVal(-15, 15, 1),
  };

  // Quarter-only metrics
  const quarterOnly = isQuarter;

  return {
    ...base,
    pctContribCurrent: quarterOnly ? randomVal(0.1, 15, 1) : undefined,
    pctContribQoQ: quarterOnly ? randomVal(-5, 5, 1) : undefined,
    volumeCurrent: randomVal(10000, 500000),
    volumeQoQ: randomVal(-10, 10, 1),
    scaledVolCurrent: quarterOnly ? randomVal(10000, 500000) : undefined,
    scaledVolQoQ: quarterOnly ? randomVal(-10, 10, 1) : undefined,
    nsvDollarCurrent: quarterOnly ? randomVal(50000, 2000000) : undefined,
    nsvDollarQoQ: quarterOnly ? randomVal(-15, 15, 1) : undefined,
    gsvCurrent: quarterOnly ? randomVal(80000, 3000000) : undefined,
    gsvQoQ: quarterOnly ? randomVal(-15, 15, 1) : undefined,
    nsvRoiCurrent: quarterOnly && !ex.has('nsvRoi') ? randomVal(0.5, 8, 2) : undefined,
    nsvRoiQoQ: quarterOnly && !ex.has('nsvRoi') ? randomVal(-2, 2, 2) : undefined,
    macRoiCurrent: quarterOnly && !ex.has('macRoi') ? randomVal(0.3, 6, 2) : undefined,
    macRoiQoQ: quarterOnly && !ex.has('macRoi') ? randomVal(-2, 2, 2) : undefined,
    effectivenessCurrent: ex.has('effectiveness') ? undefined : randomVal(0.2, 1, 2),
    effectivenessQoQ: ex.has('effectiveness') ? undefined : randomVal(-0.3, 0.3, 2),
  };
}

function computeTotals(rows: RowData[], isQuarter: boolean): RowData {
  const sum = (fn: (r: RowData) => number | undefined) =>
    rows.reduce((acc, r) => acc + (fn(r) ?? 0), 0);
  const avg = (fn: (r: RowData) => number | undefined) => {
    const vals = rows.map(fn).filter((v): v is number => v !== undefined);
    return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : undefined;
  };

  const totals: RowData = {
    channel: 'Total',
    plannedSpend: sum((r) => r.plannedSpend),
    plannedSpendTrend: avg((r) => r.plannedSpendTrend),
    essentialSpend: sum((r) => r.essentialSpend),
    essentialSpendTrend: avg((r) => r.essentialSpendTrend),
    workingSpend: sum((r) => r.workingSpend),
    workingSpendTrend: avg((r) => r.workingSpendTrend),
    impressions: sum((r) => r.impressions),
    impressionsTrend: avg((r) => r.impressionsTrend),
    samples: sum((r) => r.samples),
    samplesTrend: avg((r) => r.samplesTrend),
    cpmCpp: avg((r) => r.cpmCpp),
    cpmCppTrend: avg((r) => r.cpmCppTrend),
    coverageFactor: avg((r) => r.coverageFactor),
    coverageFactorTrend: avg((r) => r.coverageFactorTrend),
    nsvNumber: sum((r) => r.nsvNumber),
    nsvNumberTrend: avg((r) => r.nsvNumberTrend),
    macNumber: sum((r) => r.macNumber),
    macNumberTrend: avg((r) => r.macNumberTrend),
  };

  if (isQuarter) {
    totals.pctContribCurrent = sum((r) => r.pctContribCurrent);
    totals.pctContribQoQ = avg((r) => r.pctContribQoQ);
    totals.volumeCurrent = sum((r) => r.volumeCurrent);
    totals.volumeQoQ = avg((r) => r.volumeQoQ);
    totals.scaledVolCurrent = sum((r) => r.scaledVolCurrent);
    totals.scaledVolQoQ = avg((r) => r.scaledVolQoQ);
    totals.nsvDollarCurrent = sum((r) => r.nsvDollarCurrent);
    totals.nsvDollarQoQ = avg((r) => r.nsvDollarQoQ);
    totals.gsvCurrent = sum((r) => r.gsvCurrent);
    totals.gsvQoQ = avg((r) => r.gsvQoQ);
    totals.nsvRoiCurrent = avg((r) => r.nsvRoiCurrent);
    totals.nsvRoiQoQ = avg((r) => r.nsvRoiQoQ);
    totals.macRoiCurrent = avg((r) => r.macRoiCurrent);
    totals.macRoiQoQ = avg((r) => r.macRoiQoQ);
    totals.effectivenessCurrent = avg((r) => r.effectivenessCurrent);
    totals.effectivenessQoQ = avg((r) => r.effectivenessQoQ);
  }

  return totals;
}

export function generateReportData(period: string, _trendMode?: string): RowGroup[] {
  const isQuarter = period.startsWith('Q');

  const groups = [
    {
      name: 'Base',
      collapsible: true,
      rows: [
        generateRow('Other Base Features', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Competitor Average Price', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Competitor TDP', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Inflation', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Seasonality', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Temperature', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Average Price', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Change of TDP', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Trade (Feature & Display)', isQuarter, GROUP_EXCLUSIONS['Base']),
        generateRow('Promo', isQuarter, GROUP_EXCLUSIONS['Base']),
      ],
    },
    {
      name: 'Social',
      collapsible: true,
      rows: [
        generateRow('Owned + Paid', isQuarter, GROUP_EXCLUSIONS['Social']),
        generateRow('In-house Influencers', isQuarter, GROUP_EXCLUSIONS['Social']),
        generateRow('PR Box', isQuarter, GROUP_EXCLUSIONS['Social']),
        generateRow('Adfairy', isQuarter, GROUP_EXCLUSIONS['Social']),
        generateRow('Kale', isQuarter, GROUP_EXCLUSIONS['Social']),
      ],
    },
    {
      name: 'Experiential Marketing',
      collapsible: true,
      rows: [generateRow('Experiential', isQuarter, GROUP_EXCLUSIONS['Experiential Marketing'])],
    },
    {
      name: 'Shopper Marketing',
      collapsible: true,
      rows: [generateRow('Shopper', isQuarter, GROUP_EXCLUSIONS['Shopper Marketing'])],
    },
  ];

  return groups.map((g) => ({
    ...g,
    totals: computeTotals(g.rows, isQuarter),
  }));
}
