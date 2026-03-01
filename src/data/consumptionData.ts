export interface BreakoutItem {
  label: string;
  value: number;
  trend: number;
}

export interface ConsumptionTileData {
  label: string;
  total: number;
  trend: number;
  frozen: number;
  frozenTrend: number;
  fd: number;
  fdTrend: number;
  drillable: boolean;
  frozenTypeBreakout?: BreakoutItem[];
  frozenPackageBreakout?: BreakoutItem[];
  fdTypeBreakout?: BreakoutItem[];
  fdPackageBreakout?: BreakoutItem[];
}

// Simple seeded random based on string hash
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return (h % 10000) / 10000;
  };
}

function sVal(rng: () => number, min: number, max: number, decimals = 0): number {
  return Number((rng() * (max - min) + min).toFixed(decimals));
}

const FROZEN_TYPES = ['Milk', 'Dark', 'Greek'];
const FROZEN_PACKAGES = ['8oz', '18oz', '24oz'];
const FD_TYPES = ['Milk', 'Dark', 'Creme'];
const FD_PACKAGES = ['1.7oz', '3.4oz', '6.5oz'];

function splitInto3(rng: () => number, total: number, labels: string[]): BreakoutItem[] {
  const r1 = sVal(rng, 0.2, 0.5, 3);
  const r2 = sVal(rng, 0.2, (1 - r1) * 0.9, 3);
  const r3 = 1 - r1 - r2;
  const values = [Math.round(total * r1), Math.round(total * r2), Math.round(total * r3)];
  // Adjust last to ensure exact sum
  values[2] = total - values[0] - values[1];
  return labels.map((label, i) => ({
    label,
    value: values[i],
    trend: sVal(rng, -10, 10, 1),
  }));
}

export function generateConsumptionData(period: string, trendMode: string): ConsumptionTileData[] {
  const rng = seededRandom(`${period}-${trendMode}-consumption`);

  const makeTile = (label: string, drillable: boolean, totalMin: number, totalMax: number): ConsumptionTileData => {
    const total = sVal(rng, totalMin, totalMax, 0);
    const frozenPct = sVal(rng, 0.4, 0.7, 2);
    const frozen = Math.round(total * frozenPct);
    const fd = total - frozen;
    const trend = sVal(rng, -12, 12, 1);
    const frozenTrend = sVal(rng, -10, 10, 1);
    const fdTrend = sVal(rng, -10, 10, 1);

    const tile: ConsumptionTileData = { label, total, trend, frozen, frozenTrend, fd, fdTrend, drillable };

    if (drillable) {
      tile.frozenTypeBreakout = splitInto3(rng, frozen, FROZEN_TYPES);
      tile.frozenPackageBreakout = splitInto3(rng, frozen, FROZEN_PACKAGES);
      tile.fdTypeBreakout = splitInto3(rng, fd, FD_TYPES);
      tile.fdPackageBreakout = splitInto3(rng, fd, FD_PACKAGES);
    }

    return tile;
  };

  return [
    makeTile('Sales', true, 500000, 5000000),
    makeTile('Velocity', true, 1000, 50000),
    makeTile('HH Penetration', false, 10, 85),
    makeTile('Repeat Rate', false, 20, 75),
    makeTile('$/Household', false, 5, 50),
  ];
}

// ── Period-level data for Consumption Metrics Table ──

export type ConsumptionPeriodData = Record<string, Record<string, Record<string, number>>>;
// metricLabel -> rowName -> period -> value

const metricConfigs = [
  { label: 'Sales', drillable: true, min: 40000, max: 500000 },
  { label: 'Velocity', drillable: true, min: 80, max: 5000 },
  { label: 'HH Penetration', drillable: false, min: 5, max: 30 },
  { label: 'Repeat Rate', drillable: false, min: 10, max: 45 },
  { label: '$/Household', drillable: false, min: 3, max: 25 },
] as const;

const periods = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);

export function generateConsumptionPeriodData(trendMode: string): ConsumptionPeriodData {
  const result: ConsumptionPeriodData = {};

  for (const cfg of metricConfigs) {
    const rows: Record<string, Record<string, number>> = {};
    const rng = seededRandom(`${trendMode}-cperiod-${cfg.label}`);

    for (const p of periods) {
      const isDecimal = cfg.label === 'HH Penetration' || cfg.label === 'Repeat Rate' || cfg.label === '$/Household';
      const total = sVal(rng, cfg.min, cfg.max, isDecimal ? 1 : 0);
      const frozenPct = sVal(rng, 0.4, 0.7, 2);
      const frozen = isDecimal ? Number((total * frozenPct).toFixed(1)) : Math.round(total * frozenPct);
      const fd = isDecimal ? Number((total - frozen).toFixed(1)) : total - frozen;

      if (!rows['Total']) rows['Total'] = {};
      if (!rows['Frozen']) rows['Frozen'] = {};
      if (!rows['FD']) rows['FD'] = {};
      rows['Total'][p] = total;
      rows['Frozen'][p] = frozen;
      rows['FD'][p] = fd;

      if (cfg.drillable) {
        // Split frozen into Type and Package breakouts
        const frozenTypeRng = seededRandom(`${trendMode}-${cfg.label}-${p}-frozenType`);
        const frozenPkgRng = seededRandom(`${trendMode}-${cfg.label}-${p}-frozenPkg`);
        const fdTypeRng = seededRandom(`${trendMode}-${cfg.label}-${p}-fdType`);
        const fdPkgRng = seededRandom(`${trendMode}-${cfg.label}-${p}-fdPkg`);

        const frozenTypes = splitInto3(frozenTypeRng, frozen, FROZEN_TYPES);
        const frozenPkgs = splitInto3(frozenPkgRng, frozen, FROZEN_PACKAGES);
        const fdTypes = splitInto3(fdTypeRng, fd, FD_TYPES);
        const fdPkgs = splitInto3(fdPkgRng, fd, FD_PACKAGES);

        for (const item of frozenTypes) {
          const key = `Frozen Type ${item.label}`;
          if (!rows[key]) rows[key] = {};
          rows[key][p] = item.value;
        }
        for (const item of frozenPkgs) {
          const key = `Frozen Package ${item.label}`;
          if (!rows[key]) rows[key] = {};
          rows[key][p] = item.value;
        }
        for (const item of fdTypes) {
          const key = `FD Type ${item.label}`;
          if (!rows[key]) rows[key] = {};
          rows[key][p] = item.value;
        }
        for (const item of fdPkgs) {
          const key = `FD Package ${item.label}`;
          if (!rows[key]) rows[key] = {};
          rows[key][p] = item.value;
        }
      }
    }
    result[cfg.label] = rows;
  }
  return result;
}
