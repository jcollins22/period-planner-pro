export type PeriodType = 'period' | 'quarter';

export const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'] as const;
export const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export interface RowData {
  channel: string;
  plannedSpend?: number;
  plannedSpendTrend?: number;
  actualSpend?: number;
  actualSpendTrend?: number;
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
}

function randomVal(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function generateRow(channel: string, isQuarter: boolean): RowData {
  const base: RowData = {
    channel,
    plannedSpend: randomVal(5000, 200000),
    plannedSpendTrend: randomVal(-15, 15, 1),
    actualSpend: randomVal(5000, 200000),
    actualSpendTrend: randomVal(-15, 15, 1),
    workingSpend: randomVal(3000, 150000),
    workingSpendTrend: randomVal(-15, 15, 1),
    impressions: randomVal(100000, 5000000),
    impressionsTrend: randomVal(-15, 15, 1),
    samples: randomVal(0, 50000),
    samplesTrend: randomVal(-15, 15, 1),
    cpmCpp: randomVal(2, 25, 2),
    cpmCppTrend: randomVal(-15, 15, 1),
    coverageFactor: randomVal(0.1, 1, 2),
    coverageFactorTrend: randomVal(-15, 15, 1),
    nsvNumber: randomVal(100000, 2000000),
    nsvNumberTrend: randomVal(-15, 15, 1),
    macNumber: randomVal(50000, 1000000),
    macNumberTrend: randomVal(-15, 15, 1),
  };

  if (isQuarter) {
    return {
      ...base,
      pctContribCurrent: randomVal(0.1, 15, 1),
      pctContribQoQ: randomVal(-5, 5, 1),
      volumeCurrent: randomVal(10000, 500000),
      volumeQoQ: randomVal(-10, 10, 1),
      scaledVolCurrent: randomVal(10000, 500000),
      scaledVolQoQ: randomVal(-10, 10, 1),
      nsvDollarCurrent: randomVal(50000, 2000000),
      nsvDollarQoQ: randomVal(-15, 15, 1),
      gsvCurrent: randomVal(80000, 3000000),
      gsvQoQ: randomVal(-15, 15, 1),
      nsvRoiCurrent: randomVal(0.5, 8, 2),
      nsvRoiQoQ: randomVal(-2, 2, 2),
      macRoiCurrent: randomVal(0.3, 6, 2),
      macRoiQoQ: randomVal(-2, 2, 2),
      effectivenessCurrent: randomVal(0.2, 1, 2),
      effectivenessQoQ: randomVal(-0.3, 0.3, 2),
    };
  }

  return base;
}

export function generateReportData(period: string, _trendMode?: string): RowGroup[] {
  const isQuarter = period.startsWith('Q');

  return [
    {
      name: 'Base',
      collapsible: true,
      rows: [
        generateRow('Other Base Features', isQuarter),
        generateRow('Competitor Average Price', isQuarter),
        generateRow('Competitor TDP', isQuarter),
        generateRow('Inflation', isQuarter),
        generateRow('Seasonality', isQuarter),
        generateRow('Temperature', isQuarter),
        generateRow('Average Price', isQuarter),
        generateRow('Change of TDP', isQuarter),
        generateRow('Trade (Feature & Display)', isQuarter),
        generateRow('Promo', isQuarter),
      ],
    },
    {
      name: 'Social',
      collapsible: true,
      rows: [
        generateRow('Owned + Paid', isQuarter),
        generateRow('In-house Influencers', isQuarter),
        generateRow('PR Box', isQuarter),
        generateRow('Adfairy', isQuarter),
        generateRow('Kale', isQuarter),
        generateRow('New Social Channel', isQuarter),
        generateRow('Essential Spend - Non Working', isQuarter),
      ],
    },
    {
      name: 'Experiential Marketing',
      collapsible: true,
      rows: [
        generateRow('Samples At/Near Store', isQuarter),
        generateRow('Samples Away from Store', isQuarter),
        generateRow('Samples at Event', isQuarter),
        generateRow('Essential Spend - Non Working', isQuarter),
      ],
    },
    {
      name: 'Shopper Marketing',
      collapsible: true,
      rows: [
        generateRow('Shopper Tactic 1', isQuarter),
        generateRow('Shopper Tactic 2', isQuarter),
        generateRow('Shopper Tactic 3', isQuarter),
      ],
    },
  ];
}
