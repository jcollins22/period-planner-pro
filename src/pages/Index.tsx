import { useState } from 'react';
import { Link } from 'react-router-dom';
import PeriodSelector, { allInputCols, allCalcCols, allOutputCols, type TrendMode } from '@/components/PeriodSelector';
import ReportTable from '@/components/ReportTable';
import ConsumptionTiles from '@/components/ConsumptionTiles';

const Index = () => {
  const [period, setPeriod] = useState('Q1');
  const [visibleInputs, setVisibleInputs] = useState<string[]>([...allInputCols]);
  const [visibleCalcs, setVisibleCalcs] = useState<string[]>([...allCalcCols]);
  const [visibleOutputs, setVisibleOutputs] = useState<string[]>([...allOutputCols]);
  const [trendMode, setTrendMode] = useState<TrendMode>('QoQ');

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Media Mix Model — Interactive Report
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Select a period or quarter to populate the report data
            </p>
          </div>
          <Link
            to="/channel-metrics"
            className="px-3 py-1.5 text-[12px] font-medium rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Channel Metrics →
          </Link>
        </div>
        <PeriodSelector
          selected={period}
          onSelect={setPeriod}
          visibleInputs={visibleInputs}
          onVisibleInputsChange={setVisibleInputs}
          visibleCalcs={visibleCalcs}
          onVisibleCalcsChange={setVisibleCalcs}
          visibleOutputs={visibleOutputs}
          onVisibleOutputsChange={setVisibleOutputs}
          trendMode={trendMode}
          onTrendModeChange={setTrendMode}
        />
        <ConsumptionTiles period={period} trendMode={trendMode} />
        <ReportTable
          period={period}
          visibleInputs={visibleInputs}
          visibleCalcs={visibleCalcs}
          visibleOutputs={visibleOutputs}
          trendMode={trendMode}
        />
      </div>
    </div>
  );
};

export default Index;
