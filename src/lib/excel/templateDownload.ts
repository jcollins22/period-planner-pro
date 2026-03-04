import * as XLSX from 'xlsx';

const PERIOD_HEADERS = ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13'];
const QUARTER_HEADERS = ['Q1','Q2','Q3','Q4'];

const METRICS = [
  'Planned Spend', 'Essential Spend (non working)', 'Working Spend', 'Impressions', 'Samples',
  'CPM & CPP', 'Coverage Factor', 'NSV Number', 'MAC Number',
  '% Contribution', 'Volume', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI', 'Effectiveness',
];

const QUARTER_ONLY_METRICS = new Set([
  '% Contribution', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI',
]);

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

const PERIOD_ZEROS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const QUARTER_ZEROS = [0, 0, 0, 0];
const PERIOD_BLANKS = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
const QUARTER_BLANKS = ['', '', '', ''];

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Channels ──
  const channelsHeaders = ['Group', 'Channel', 'Metric', ...PERIOD_HEADERS, ...QUARTER_HEADERS];
  const channelsData: (string | number)[][] = [channelsHeaders];

  CHANNEL_GROUPS.forEach((g) => {
    const excluded = GROUP_EXCLUDED_METRICS[g.group] ?? [];
    const channels = g.channels.length > 0 ? g.channels : [g.group];
    channels.forEach((ch) => {
      METRICS.filter((m) => !excluded.includes(m)).forEach((m) => {
        if (QUARTER_ONLY_METRICS.has(m)) {
          channelsData.push([g.group, ch, m, ...PERIOD_BLANKS, ...QUARTER_ZEROS]);
        } else {
          channelsData.push([g.group, ch, m, ...PERIOD_ZEROS, ...QUARTER_BLANKS]);
        }
      });
    });
  });

  const channelsWs = XLSX.utils.aoa_to_sheet(channelsData);
  XLSX.utils.book_append_sheet(wb, channelsWs, 'Channels');

  // ── Sheet 2: Consumption ──
  const consumptionHeaders = ['Metric', 'Level 1', 'Level 2', 'Level 3', ...PERIOD_HEADERS];
  const consumptionData: (string | number)[][] = [consumptionHeaders];

  // Sales
  consumptionData.push(['Sales', 'Total', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Milk', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Dark', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Type', 'Greek', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Package', '8oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Package', '18oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'Frozen', 'Package', '24oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Type', 'Milk', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Type', 'Dark', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Type', 'Creme', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Package', '1.7oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Package', '3.4oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Sales', 'FD', 'Package', '6.5oz', ...PERIOD_ZEROS]);

  // Velocity
  consumptionData.push(['Velocity', 'Total', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Milk', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Dark', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Type', 'Greek', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '8oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '18oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'Frozen', 'Package', '24oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Milk', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Dark', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Type', 'Creme', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Package', '1.7oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Package', '3.4oz', ...PERIOD_ZEROS]);
  consumptionData.push(['Velocity', 'FD', 'Package', '6.5oz', ...PERIOD_ZEROS]);

  // HH Penetration
  consumptionData.push(['HH Penetration', 'Total', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['HH Penetration', 'Frozen', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['HH Penetration', 'FD', '', '', ...PERIOD_ZEROS]);

  // Repeat Rate
  consumptionData.push(['Repeat Rate', 'Total', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Repeat Rate', 'Frozen', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['Repeat Rate', 'FD', '', '', ...PERIOD_ZEROS]);

  // $/Household
  consumptionData.push(['$/Household', 'Total', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['$/Household', 'Frozen', '', '', ...PERIOD_ZEROS]);
  consumptionData.push(['$/Household', 'FD', '', '', ...PERIOD_ZEROS]);

  const consumptionWs = XLSX.utils.aoa_to_sheet(consumptionData);
  XLSX.utils.book_append_sheet(wb, consumptionWs, 'Consumption');

  XLSX.writeFile(wb, 'mmm-template.xlsx');
}
