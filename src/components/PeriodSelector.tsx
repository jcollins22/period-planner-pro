import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { periods, quarters } from '@/data/reportData';

export type TrendMode = 'QoQ' | 'YoY' | 'none';

interface PeriodSelectorProps {
  selected: string;
  onSelect: (period: string) => void;
  visibleInputs: string[];
  onVisibleInputsChange: (cols: string[]) => void;
  visibleCalcs: string[];
  onVisibleCalcsChange: (cols: string[]) => void;
  visibleOutputs: string[];
  onVisibleOutputsChange: (cols: string[]) => void;
  trendMode: TrendMode;
  onTrendModeChange: (mode: TrendMode) => void;
}

const allInputCols = ['Planned Spend', 'Actual Spend', 'Working Spend', 'Impressions', 'Samples'];
const allCalcCols = ['CPM & CPP', 'Coverage Factor', 'NSV Number', 'MAC Number'];
const allOutputCols = ['% Contribution', 'Volume', 'Scaled Volume', 'NSV $', 'GSV', 'NSV ROI', 'MAC ROI', 'Effectiveness'];

function MultiSelectDropdown({
  label,
  allItems,
  selected,
  onChange,
  bgClass,
}: {
  label: string;
  allItems: string[];
  selected: string[];
  onChange: (items: string[]) => void;
  bgClass: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allSelected = selected.length === allItems.length;

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const selectAll = () => {
    onChange(allSelected ? [] : [...allItems]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border border-border ${bgClass} hover:opacity-90 transition-opacity`}
      >
        {label}
        <span className="text-[10px] text-muted-foreground">
          ({selected.length}/{allItems.length})
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] hover:bg-accent transition-colors text-left font-semibold"
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${allSelected ? 'bg-primary border-primary' : 'border-input'}`}>
              {allSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
            </div>
            Select All
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          {allItems.map((item) => {
            const checked = selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleItem(item)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] hover:bg-accent transition-colors text-left"
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${checked ? 'bg-primary border-primary' : 'border-input'}`}>
                  {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>
                {item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const trendOptions: TrendMode[] = ['QoQ', 'YoY', 'none'];

export default function PeriodSelector({
  selected,
  onSelect,
  visibleInputs,
  onVisibleInputsChange,
  visibleCalcs,
  onVisibleCalcsChange,
  visibleOutputs,
  onVisibleOutputsChange,
  trendMode,
  onTrendModeChange,
}: PeriodSelectorProps) {
  const isQuarter = selected.startsWith('Q');

  return (
    <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex flex-col gap-3">
        {/* Row 1: Period buttons (left) + Trend toggle (right) */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Period
            </label>
            <div className="flex gap-1 flex-wrap">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => onSelect(p)}
                  className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                    selected === p
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Trend
            </span>
            {trendOptions.map((mode) => (
              <button
                key={mode}
                onClick={() => onTrendModeChange(mode)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                  trendMode === mode
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {mode === 'none' ? 'None' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Quarter buttons (left) + Column dropdowns (right) */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quarter
            </label>
            <div className="flex gap-1">
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => onSelect(q)}
                  className={`px-3 py-1 text-[12px] font-medium rounded transition-colors ${
                    selected === q
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <MultiSelectDropdown
              label="Inputs"
              allItems={allInputCols}
              selected={visibleInputs}
              onChange={onVisibleInputsChange}
              bgClass="bg-report-input-light"
            />
            {isQuarter && (
              <MultiSelectDropdown
                label="Calculated"
                allItems={allCalcCols}
                selected={visibleCalcs}
                onChange={onVisibleCalcsChange}
                bgClass="bg-report-calc-light"
              />
            )}
            {isQuarter && (
              <MultiSelectDropdown
                label="Outputs"
                allItems={allOutputCols}
                selected={visibleOutputs}
                onChange={onVisibleOutputsChange}
                bgClass="bg-report-output-light"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { allInputCols, allCalcCols, allOutputCols };
