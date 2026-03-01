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
    channels: [],
  },
  {
    group: 'Shopper Marketing',
    channels: [],
  },
];

/** Generate sample values that vary slightly per channel/metric so data is distinguishable */
function sampleValues(groupIdx: number, channelIdx: number, metricIdx: number): number[] {
  const seed = (groupIdx + 1) * 100 + (channelIdx + 1) * 10 + metricIdx;
  const base = 1000 + seed * 3;
  return Array.from({ length: 13 }, (_, i) => Math.round(base + i * (50 + metricIdx * 5)));
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Channels ──
  const channelsHeaders = ['Group', 'Channel', 'Metric', ...PERIOD_HEADERS];
  const channelsData: (string | number)[][] = [channelsHeaders];

  CHANNEL_GROUPS.forEach((g, gi) => {
    const excluded = GROUP_EXCLUDED_METRICS[g.group] ?? [];
    g.channels.forEach((ch, ci) => {
      METRICS.filter((m) => !excluded.includes(m)).forEach((m, mi) => {
        channelsData.push([g.group, ch, m, ...sampleValues(gi, ci, mi)]);
      });
    });
  });

  const channelsWs = XLSX.utils.aoa_to_sheet(channelsData);
  XLSX.utils.book_append_sheet(wb, channelsWs, 'Channels');

  // ── Sheet 2: Consumption ──
  const consumptionHeaders = ['Metric', 'Level 1', 'Level 2', ...PERIOD_HEADERS];
  const consumptionData: (string | number)[][] = [
    consumptionHeaders,
    ['Sales', 'Total', '', 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 0],
    ['Sales', 'Frozen', '', 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 0],
    ['Sales', 'Frozen', 'Core', 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400, 2450, 2500, 2550, 0],
    ['Sales', 'Frozen', 'Greek', 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 0],
    ['Sales', 'FD', '', 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 0],
    ['Sales', 'FD', 'Core', 1200, 1260, 1320, 1380, 1440, 1500, 1560, 1620, 1680, 1740, 1800, 1860, 0],
    ['Sales', 'FD', 'Creme', 800, 840, 880, 920, 960, 1000, 1040, 1080, 1120, 1160, 1200, 1240, 0],
    ['Velocity', 'Total', '', 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 0],
    ['HH Penetration', 'Total', '', 0.25, 0.26, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0],
    ['Total Repeat Rate', 'Total', '', 0.40, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.50, 0.51, 0],
    ['$/Household', 'Total', '', 8.50, 8.75, 9.00, 9.25, 9.50, 9.75, 10.00, 10.25, 10.50, 10.75, 11.00, 11.25, 0],
  ];
  const consumptionWs = XLSX.utils.aoa_to_sheet(consumptionData);
  XLSX.utils.book_append_sheet(wb, consumptionWs, 'Consumption');

  // ── Sheet 3: Period ──
  const periodHeaders = ['Channel', 'Metric', ...PERIOD_HEADERS];
  const periodData: (string | number)[][] = [
    periodHeaders,
    ['TV', 'Spend', 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500, 0],
    ['TV', 'Impressions', 100000, 110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 210000, 0],
    ['Digital', 'Spend', 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800, 5000, 5200, 0],
    ['Digital', 'Impressions', 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000, 420000, 0],
  ];
  const periodWs = XLSX.utils.aoa_to_sheet(periodData);
  XLSX.utils.book_append_sheet(wb, periodWs, 'Period');

  XLSX.writeFile(wb, 'mmm-template.xlsx');
}
