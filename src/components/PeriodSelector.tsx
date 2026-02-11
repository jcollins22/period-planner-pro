import { periods, quarters } from '@/data/reportData';

interface PeriodSelectorProps {
  selected: string;
  onSelect: (period: string) => void;
}

export default function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-6 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
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
      <div className="w-px h-10 bg-border" />
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
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
      <div className="ml-auto text-[13px] font-semibold text-foreground">
        Selected: <span className="text-primary">{selected}</span>
      </div>
    </div>
  );
}
