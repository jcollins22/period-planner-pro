export interface SubSplit {
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
  frozenCore?: SubSplit;
  frozenGreek?: SubSplit;
  fdCore?: SubSplit;
  fdCreme?: SubSplit;
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
      const coreP = sVal(rng, 0.5, 0.75, 2);
      tile.frozenCore = { value: Math.round(frozen * coreP), trend: sVal(rng, -8, 8, 1) };
      tile.frozenGreek = { value: frozen - Math.round(frozen * coreP), trend: sVal(rng, -8, 8, 1) };
      tile.fdCore = { value: Math.round(fd * coreP), trend: sVal(rng, -8, 8, 1) };
      tile.fdCreme = { value: fd - Math.round(fd * coreP), trend: sVal(rng, -8, 8, 1) };
    }

    return tile;
  };

  return [
    makeTile('Sales', true, 500000, 5000000),
    makeTile('Velocity', true, 1000, 50000),
    makeTile('HH Penetration', false, 10, 85),
    makeTile('Total Repeat Rate', false, 20, 75),
    makeTile('$/Household', false, 5, 50),
  ];
}
