import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { generateConsumptionData, type ConsumptionTileData, type BreakoutItem } from '@/data/consumptionData';
import type { TrendMode } from '@/components/PeriodSelector';

interface ConsumptionTilesProps {
  period: string;
  trendMode: TrendMode;
  data?: ConsumptionTileData[];
}

const fmtVal = (v: number, label: string) => {
  if (label === 'HH Penetration' || label === 'Repeat Rate') return v.toFixed(1) + '%';
  if (label === '$/Household') return '$' + v.toFixed(2);
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString();
};

const fmtSub = (v: number, label: string) => {
  if (label === 'HH Penetration' || label === 'Repeat Rate') return v.toFixed(1) + '%';
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

function BreakoutSection({ title, items, tileLabel, bgClass, textClass }: {
  title: string;
  items: BreakoutItem[];
  tileLabel: string;
  bgClass: string;
  textClass: string;
}) {
  return (
    <div>
      <div className={`text-[8px] font-semibold uppercase tracking-wider ${textClass} mb-0.5`}>{title}</div>
      <div className="grid grid-cols-3 gap-1">
        {items.map(item => (
          <div key={item.label} className={`rounded px-1.5 py-1 ${bgClass}`}>
            <div className={`text-[8px] ${textClass} font-semibold`}>{item.label}</div>
            <div className={`text-[10px] font-bold ${textClass}`}>{fmtSub(item.value, tileLabel)}</div>
            <TrendBadge value={item.trend} />
          </div>
        ))}
      </div>
    </div>
  );
}

type Segment = 'frozen' | 'fd';
type BreakoutDim = 'type' | 'package';

function Tile({ tile }: { tile: ConsumptionTileData }) {
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [activeBreakout, setActiveBreakout] = useState<BreakoutDim | null>(null);

  const handleSegmentClick = (seg: Segment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSegment === seg) {
      setActiveSegment(null);
      setActiveBreakout(null);
    } else {
      setActiveSegment(seg);
      setActiveBreakout(null);
    }
  };

  const handleBreakoutClick = (dim: BreakoutDim, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveBreakout(activeBreakout === dim ? null : dim);
  };

  // Determine which breakout data to show
  const breakoutItems = activeSegment && activeBreakout ? (() => {
    if (activeSegment === 'frozen' && activeBreakout === 'type') return tile.frozenTypeBreakout;
    if (activeSegment === 'frozen' && activeBreakout === 'package') return tile.frozenPackageBreakout;
    if (activeSegment === 'fd' && activeBreakout === 'type') return tile.fdTypeBreakout;
    if (activeSegment === 'fd' && activeBreakout === 'package') return tile.fdPackageBreakout;
    return undefined;
  })() : undefined;

  const isFrozenActive = activeSegment === 'frozen';
  const isFdActive = activeSegment === 'fd';

  // Color schemes
  const frozenColors = { bgClass: 'bg-[hsl(210_50%_96%)]', textClass: 'text-[hsl(210_50%_35%)]' };
  const fdColors = { bgClass: 'bg-[hsl(35_60%_94%)]', textClass: 'text-[hsl(35_50%_35%)]' };
  const activeColors = activeSegment === 'frozen' ? frozenColors : fdColors;

  return (
    <div className="flex-1 min-w-[160px] bg-card border border-border rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tile.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-bold text-foreground">{fmtVal(tile.total, tile.label)}</span>
        <TrendBadge value={tile.trend} />
      </div>

      <div className="flex gap-2">
        <div
          className={`flex-1 rounded px-2 py-1 bg-[hsl(210_60%_94%)] transition-all ${tile.drillable ? 'cursor-pointer hover:ring-1 hover:ring-[hsl(210_60%_60%)]' : ''} ${isFrozenActive ? 'ring-2 ring-[hsl(210_60%_50%)]' : ''}`}
          onClick={tile.drillable ? (e) => handleSegmentClick('frozen', e) : undefined}
        >
          <div className="text-[9px] font-semibold text-[hsl(210_60%_35%)] uppercase">Frozen</div>
          <div className="text-[11px] font-bold text-[hsl(210_60%_30%)]">{fmtSub(tile.frozen, tile.label)}</div>
          <TrendBadge value={tile.frozenTrend} />
        </div>
        <div
          className={`flex-1 rounded px-2 py-1 bg-[hsl(35_70%_92%)] transition-all ${tile.drillable ? 'cursor-pointer hover:ring-1 hover:ring-[hsl(35_60%_55%)]' : ''} ${isFdActive ? 'ring-2 ring-[hsl(35_60%_45%)]' : ''}`}
          onClick={tile.drillable ? (e) => handleSegmentClick('fd', e) : undefined}
        >
          <div className="text-[9px] font-semibold text-[hsl(35_60%_35%)] uppercase">FD</div>
          <div className="text-[11px] font-bold text-[hsl(35_60%_30%)]">{fmtSub(tile.fd, tile.label)}</div>
          <TrendBadge value={tile.fdTrend} />
        </div>
      </div>

      {activeSegment && tile.drillable && (
        <div className="mt-2 pt-2 border-t border-border space-y-2">
          {/* Pill buttons */}
          <div className="flex gap-1.5">
            {(['type', 'package'] as BreakoutDim[]).map(dim => {
              const isActive = activeBreakout === dim;
              return (
                <button
                  key={dim}
                  onClick={(e) => handleBreakoutClick(dim, e)}
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? `${activeColors.bgClass} ${activeColors.textClass} ring-1 ring-current`
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {dim}
                </button>
              );
            })}
          </div>

          {/* Selected breakout */}
          {breakoutItems && (
            <BreakoutSection
              title={`By ${activeBreakout}`}
              items={breakoutItems}
              tileLabel={tile.label}
              bgClass={activeColors.bgClass}
              textClass={activeColors.textClass}
            />
          )}
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
