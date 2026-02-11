import { useState } from 'react';
import PeriodSelector from '@/components/PeriodSelector';
import ReportTable from '@/components/ReportTable';

const Index = () => {
  const [period, setPeriod] = useState('Q1');

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Media Mix Model — Interactive Report
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Select a period or quarter to populate the report data
          </p>
        </div>
        <PeriodSelector selected={period} onSelect={setPeriod} />
        <ReportTable period={period} />
      </div>
    </div>
  );
};

export default Index;
