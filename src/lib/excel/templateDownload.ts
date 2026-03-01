import * as XLSX from 'xlsx';

const PERIOD_HEADERS = ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13'];

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Channels ──
  const channelsHeaders = ['Group', 'Channel', 'Metric', ...PERIOD_HEADERS];
  const channelsData: (string | number)[][] = [
    channelsHeaders,
    ['Base', 'Owned + Paid', 'Planned Spend', 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 0],
    ['Base', 'Owned + Paid', 'Actual Spend', 950, 1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950, 2050, 0],
    ['Base', 'Owned + Paid', 'Working Spend', 800, 880, 960, 1040, 1120, 1200, 1280, 1360, 1440, 1520, 1600, 1680, 0],
    ['Base', 'Owned + Paid', 'Impressions', 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 105000, 0],
    ['Base', 'Owned + Paid', 'Samples', 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 0],
    ['Base', 'Owned + Paid', 'CPM & CPP', 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 0],
    ['Base', 'Owned + Paid', 'Coverage Factor', 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0, 1.0, 0],
    ['Base', 'Owned + Paid', 'NSV Number', 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 7200, 0],
    ['Base', 'Owned + Paid', 'MAC Number', 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 0],
    ['Base', 'Owned + Paid', '% Contribution', 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 0],
    ['Base', 'Owned + Paid', 'Volume', 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 0],
    ['Base', 'Owned + Paid', 'Scaled Volume', 8000, 8400, 8800, 9200, 9600, 10000, 10400, 10800, 11200, 11600, 12000, 12400, 0],
    ['Base', 'Owned + Paid', 'NSV $', 50000, 52000, 54000, 56000, 58000, 60000, 62000, 64000, 66000, 68000, 70000, 72000, 0],
    ['Base', 'Owned + Paid', 'GSV', 60000, 62000, 64000, 66000, 68000, 70000, 72000, 74000, 76000, 78000, 80000, 82000, 0],
    ['Base', 'Owned + Paid', 'NSV ROI', 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 0],
    ['Base', 'Owned + Paid', 'MAC ROI', 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 0],
    ['Base', 'Owned + Paid', 'Effectiveness', 0.75, 0.77, 0.79, 0.81, 0.83, 0.85, 0.87, 0.89, 0.91, 0.93, 0.95, 0.97, 0],
    // Example row for another group
    ['Social', 'Instagram', 'Planned Spend', 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 0],
  ];
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
