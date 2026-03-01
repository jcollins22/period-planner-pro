import * as XLSX from 'xlsx';

const PERIOD_HEADERS = ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13'];

const METRICS = [
  'Planned Spend', 'Essential Spend (non working)', 'Working Spend', 'Impressions', 'Samples',
  'CPM & CPP', 'Coverage Factor', 'NSV Number', 'MAC Number',
  '% Contribution', 'Volume', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI', 'Effectiveness',
];

const GROUP_EXCLUDED_METRICS: Record<string, string[]> = {
  Base: ['Planned Spend', 'Essential Spend (non working)', 'Working Spend', 'Impressions', 'Samples', 'CPM & CPP', 'NSV ROI', 'MAC ROI', 'Effectiveness'],
  Social: ['Samples'],
  'Experiential Marketing': ['Impressions', 'Effectiveness'],
  'Shopper Marketing': ['Impressions', 'Samples', 'Effectiveness'],
};

const CHANNEL_GROUPS: { group: string; channels: string[] }[] = [
  {
    group: 'Base',
    channels: [
      'Other Base Features', 'Competitor Average Price', 'Competitor TDP',
      'Inflation', 'Seasonality', 'Temperature', 'Average Price',
      'Change of TDP', 'Trade (Feature & Display)', 'Promo',
    ],
  },
  {
    group: 'Social',
    channels: [
      'Owned + Paid', 'In-house Influencers', 'PR Box', 'Adfairy', 'Kale',
    ],
  },
  {
    group: 'Experiential Marketing',
    channels: ['Experiential'],
  },
  {
    group: 'Shopper Marketing',
    channels: ['Shopper'],
  },
];

/** Generate sample values that vary slightly per channel/metric so data is distinguishable */
function sampleValues(groupIdx: number, channelIdx: number, metricIdx: number): number[] {
  const seed = (groupIdx + 1) * 100 + (channelIdx + 1) * 10 + metricIdx;
  const base = 1000 + seed * 3;
  return Array.from({ length: 13 }, (_, i) => Math.round(base + i * (50 + metricIdx * 5)));
}

function splitSample(parentValues: number[], ratios: number[]): number[][] {
  return ratios.map((r, ri) =>
    parentValues.map((pv, pi) => {
      if (ri === ratios.length - 1) {
        // Last item gets remainder
        const used = ratios.slice(0, ri).reduce((acc, rr) => acc + Math.round(pv * rr), 0);
        return pv - used;
      }
      return Math.round(pv * r);
    })
  );
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Channels ──
  const channelsHeaders = ['Group', 'Channel', 'Metric', ...PERIOD_HEADERS];
  const channelsData: (string | number)[][] = [channelsHeaders];

  CHANNEL_GROUPS.forEach((g, gi) => {
    const excluded = GROUP_EXCLUDED_METRICS[g.group] ?? [];
    const channels = g.channels.length > 0 ? g.channels : [g.group];
    channels.forEach((ch, ci) => {
      METRICS.filter((m) => !excluded.includes(m)).forEach((m, mi) => {
        channelsData.push([g.group, ch, m, ...sampleValues(gi, ci, mi)]);
      });
    });
  });

  const channelsWs = XLSX.utils.aoa_to_sheet(channelsData);
  XLSX.utils.book_append_sheet(wb, channelsWs, 'Channels');

  // ── Sheet 2: Consumption ──
  const consumptionHeaders = ['Metric', 'Level 1', 'Level 2', 'Level 3', ...PERIOD_HEADERS];
  const consumptionData: (string | number)[][] = [consumptionHeaders];

  // Sales
  const salesTotalVals = [5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 7400];
  const salesFrozenVals = [3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200];
  const salesFdVals = salesTotalVals.map((t, i) => t - salesFrozenVals[i]);

  consumptionData.push(['Sales', 'Total', '', '', ...salesTotalVals]);
  consumptionData.push(['Sales', 'Frozen', '', '', ...salesFrozenVals]);
  const frozenTypeRatios = [0.4, 0.35, 0.25];
  const frozenTypeSplits = splitSample(salesFrozenVals, frozenTypeRatios);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Milk', ...frozenTypeSplits[0]]);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Dark', ...frozenTypeSplits[1]]);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Greek', ...frozenTypeSplits[2]]);
  const frozenPkgRatios = [0.3, 0.4, 0.3];
  const frozenPkgSplits = splitSample(salesFrozenVals, frozenPkgRatios);
  consumptionData.push(['Sales', 'Frozen', 'Package', '8oz', ...frozenPkgSplits[0]]);
  consumptionData.push(['Sales', 'Frozen', 'Package', '18oz', ...frozenPkgSplits[1]]);
  consumptionData.push(['Sales', 'Frozen', 'Package', '24oz', ...frozenPkgSplits[2]]);
  consumptionData.push(['Sales', 'FD', '', '', ...salesFdVals]);
  const fdTypeRatios = [0.45, 0.3, 0.25];
  const fdTypeSplits = splitSample(salesFdVals, fdTypeRatios);
  consumptionData.push(['Sales', 'FD', 'Type', 'Milk', ...fdTypeSplits[0]]);
  consumptionData.push(['Sales', 'FD', 'Type', 'Dark', ...fdTypeSplits[1]]);
  consumptionData.push(['Sales', 'FD', 'Type', 'Creme', ...fdTypeSplits[2]]);
  const fdPkgRatios = [0.35, 0.35, 0.3];
  const fdPkgSplits = splitSample(salesFdVals, fdPkgRatios);
  consumptionData.push(['Sales', 'FD', 'Package', '1.7oz', ...fdPkgSplits[0]]);
  consumptionData.push(['Sales', 'FD', 'Package', '3.4oz', ...fdPkgSplits[1]]);
  consumptionData.push(['Sales', 'FD', 'Package', '6.5oz', ...fdPkgSplits[2]]);

  // Velocity (same structure, different values)
  const velTotalVals = [12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18];
  const velFrozenVals = [7, 7.3, 7.5, 7.8, 8, 8.3, 8.5, 8.8, 9, 9.3, 9.5, 9.8, 10];
  const velFdVals = velTotalVals.map((t, i) => Number((t - velFrozenVals[i]).toFixed(1)));

  consumptionData.push(['Velocity', 'Total', '', '', ...velTotalVals]);
  consumptionData.push(['Velocity', 'Frozen', '', '', ...velFrozenVals]);
  const velFrozenTypeSplits = splitSample(velFrozenVals, frozenTypeRatios);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Milk', ...velFrozenTypeSplits[0]]);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Dark', ...velFrozenTypeSplits[1]]);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Greek', ...velFrozenTypeSplits[2]]);
  const velFrozenPkgSplits = splitSample(velFrozenVals, frozenPkgRatios);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '8oz', ...velFrozenPkgSplits[0]]);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '18oz', ...velFrozenPkgSplits[1]]);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '24oz', ...velFrozenPkgSplits[2]]);
  consumptionData.push(['Velocity', 'FD', '', '', ...velFdVals]);
  const velFdTypeSplits = splitSample(velFdVals, fdTypeRatios);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Milk', ...velFdTypeSplits[0]]);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Dark', ...velFdTypeSplits[1]]);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Creme', ...velFdTypeSplits[2]]);
  const velFdPkgSplits = splitSample(velFdVals, fdPkgRatios);
  consumptionData.push(['Velocity', 'FD', 'Package', '1.7oz', ...velFdPkgSplits[0]]);
  consumptionData.push(['Velocity', 'FD', 'Package', '3.4oz', ...velFdPkgSplits[1]]);
  consumptionData.push(['Velocity', 'FD', 'Package', '6.5oz', ...velFdPkgSplits[2]]);

  // Non-drillable metrics
  // HH Penetration
  const hhTotal = [0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37];
  const hhFrozen = hhTotal.map(v => Number((v * 0.55).toFixed(2)));
  const hhFd = hhTotal.map((v, i) => Number((v - hhFrozen[i]).toFixed(2)));
  consumptionData.push(['HH Penetration', 'Total', '', '', ...hhTotal]);
  consumptionData.push(['HH Penetration', 'Frozen', '', '', ...hhFrozen]);
  consumptionData.push(['HH Penetration', 'FD', '', '', ...hhFd]);

  // Repeat Rate
  const rrTotal = [0.40, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.50, 0.51, 0.52];
  const rrFrozen = rrTotal.map(v => Number((v * 0.6).toFixed(2)));
  const rrFd = rrTotal.map((v, i) => Number((v - rrFrozen[i]).toFixed(2)));
  consumptionData.push(['Repeat Rate', 'Total', '', '', ...rrTotal]);
  consumptionData.push(['Repeat Rate', 'Frozen', '', '', ...rrFrozen]);
  consumptionData.push(['Repeat Rate', 'FD', '', '', ...rrFd]);

  // $/Household
  const dphTotal = [8.50, 8.75, 9.00, 9.25, 9.50, 9.75, 10.00, 10.25, 10.50, 10.75, 11.00, 11.25, 11.50];
  const dphFrozen = dphTotal.map(v => Number((v * 0.5).toFixed(2)));
  const dphFd = dphTotal.map((v, i) => Number((v - dphFrozen[i]).toFixed(2)));
  consumptionData.push(['$/Household', 'Total', '', '', ...dphTotal]);
  consumptionData.push(['$/Household', 'Frozen', '', '', ...dphFrozen]);
  consumptionData.push(['$/Household', 'FD', '', '', ...dphFd]);

  const consumptionWs = XLSX.utils.aoa_to_sheet(consumptionData);
  XLSX.utils.book_append_sheet(wb, consumptionWs, 'Consumption');

  XLSX.writeFile(wb, 'mmm-template.xlsx');
}
