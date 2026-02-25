import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { generateConsumptionData, type ConsumptionTileData } from '@/data/consumptionData';
import type { TrendMode } from '@/components/PeriodSelector';

interface ConsumptionTilesProps {
  period: string;
  trendMode: TrendMode;
  data?: ConsumptionTileData[];
}

const fmtVal = (v: number, label: string) => {
  if (label === 'HH Penetration' || label === 'Total Repeat Rate') return v.toFixed(1) + '%';
  if (label === '$/Household') return '$' + v.toFixed(2);
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString();
};

const fmtSub = (v: number, label: string) => {
  if (label === 'HH Penetration' || label === 'Total Repeat Rate') return v.toFixed(1) + '%';
  if (label === '$/Household') return '$' + v.toFixed(2);
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString();
};

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] text-muted-foreground">0%</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {positive ? '+' : ''}{value}%
    </span>
  );
}

function Tile({ tile }: { tile: ConsumptionTileData }) {
  const [expanded, setExpanded] = useState(false);
  const clickable = tile.drillable;

  return (
    <div
      className={`flex-1 min-w-[160px] bg-card border border-border rounded-lg p-3 shadow-sm transition-all ${clickable ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
      onClick={() => clickable && setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tile.label}
        </span>
        {clickable && (
          expanded
            ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-bold text-foreground">{fmtVal(tile.total, tile.label)}</span>
        <TrendBadge value={tile.trend} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 rounded px-2 py-1 bg-[hsl(210_60%_94%)]">
          <div className="text-[9px] font-semibold text-[hsl(210_60%_35%)] uppercase">Frozen</div>
          <div className="text-[11px] font-bold text-[hsl(210_60%_30%)]">{fmtSub(tile.frozen, tile.label)}</div>
          <TrendBadge value={tile.frozenTrend} />
        </div>
        <div className="flex-1 rounded px-2 py-1 bg-[hsl(35_70%_92%)]">
          <div className="text-[9px] font-semibold text-[hsl(35_60%_35%)] uppercase">FD</div>
          <div className="text-[11px] font-bold text-[hsl(35_60%_30%)]">{fmtSub(tile.fd, tile.label)}</div>
          <TrendBadge value={tile.fdTrend} />
        </div>
      </div>

      {expanded && tile.drillable && (
        <div className="mt-2 pt-2 border-t border-border space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded px-1.5 py-1 bg-[hsl(210_50%_96%)]">
              <div className="text-[8px] text-[hsl(210_50%_40%)] font-semibold">Frozen Core</div>
              <div className="text-[10px] font-bold text-[hsl(210_50%_25%)]">{fmtSub(tile.frozenCore!.value, tile.label)}</div>
              <TrendBadge value={tile.frozenCore!.trend} />
            </div>
            <div className="rounded px-1.5 py-1 bg-[hsl(210_50%_96%)]">
              <div className="text-[8px] text-[hsl(210_50%_40%)] font-semibold">Frozen Greek</div>
              <div className="text-[10px] font-bold text-[hsl(210_50%_25%)]">{fmtSub(tile.frozenGreek!.value, tile.label)}</div>
              <TrendBadge value={tile.frozenGreek!.trend} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded px-1.5 py-1 bg-[hsl(35_60%_94%)]">
              <div className="text-[8px] text-[hsl(35_50%_35%)] font-semibold">FD Core</div>
              <div className="text-[10px] font-bold text-[hsl(35_50%_25%)]">{fmtSub(tile.fdCore!.value, tile.label)}</div>
              <TrendBadge value={tile.fdCore!.trend} />
            </div>
            <div className="rounded px-1.5 py-1 bg-[hsl(35_60%_94%)]">
              <div className="text-[8px] text-[hsl(35_50%_35%)] font-semibold">FD Creme</div>
              <div className="text-[10px] font-bold text-[hsl(35_50%_25%)]">{fmtSub(tile.fdCreme!.value, tile.label)}</div>
              <TrendBadge value={tile.fdCreme!.trend} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsumptionTiles({ period, trendMode, data }: ConsumptionTilesProps) {
  const tiles = useMemo(() => data ?? generateConsumptionData(period, trendMode), [data, period, trendMode]);

  return (
    <div className="flex gap-3 flex-wrap">
      {tiles.map((tile) => (
        <Tile key={tile.label} tile={tile} />
      ))}
    </div>
  );
}
