import { Link } from 'react-router-dom';
import ChannelMetricsTable from '@/components/ChannelMetricsTable';

const ChannelMetrics = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Channel Metrics — Period Breakdown
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              View working spend and output metrics by period across channels
            </p>
          </div>
          <Link
            to="/"
            className="px-3 py-1.5 text-[12px] font-medium rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            ← Back to Report
          </Link>
        </div>
        <ChannelMetricsTable />
      </div>
    </div>
  );
};

export default ChannelMetrics;
