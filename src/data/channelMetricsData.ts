export const outputMetrics = ['NSV ROI', 'Volume %', 'GSV', 'NSV', 'MAC ROI'] as const;
export type OutputMetric = typeof outputMetrics[number];

export interface ChannelGroup {
  name: string;
  metrics: string[]; // e.g. ['Working Spend', 'Impressions', 'Output Metric'] or ['Working Spend', 'Samples', 'Output Metric']
}

export const channelGroups: ChannelGroup[] = [
  { name: 'Social', metrics: ['Working Spend', 'Impressions', 'Output Metric'] },
  { name: 'Shopper', metrics: ['Working Spend', 'Output Metric'] },
  { name: 'Experiential', metrics: ['Working Spend', 'Samples', 'Output Metric'] },
];

function randomVal(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function generateMetricValue(metric: string, _outputMetric: OutputMetric): number {
  switch (metric) {
    case 'Working Spend':
      return randomVal(5000, 200000);
    case 'Impressions':
      return randomVal(100000, 5000000);
    case 'Samples':
      return randomVal(0, 50000);
    case 'Output Metric':
      switch (_outputMetric) {
        case 'NSV ROI': return randomVal(0.5, 8, 2);
        case 'Volume %': return randomVal(0.1, 15, 1);
        case 'GSV': return randomVal(80000, 3000000);
        case 'NSV': return randomVal(50000, 2000000);
        case 'MAC ROI': return randomVal(0.3, 6, 2);
        default: return 0;
      }
    default:
      return 0;
  }
}

// periods per quarter
const quarterPeriods: Record<string, string[]> = {
  Q1: ['P1', 'P2', 'P3'],
  Q2: ['P4', 'P5', 'P6'],
  Q3: ['P7', 'P8', 'P9'],
  Q4: ['P10', 'P11', 'P12'],
  P13: ['P13'],
};

export { quarterPeriods };

export type ChannelMetricsMap = Record<string, Record<string, Record<string, number>>>;
// channelName -> metricName -> periodKey -> value

export function generateChannelMetricsData(outputMetric: OutputMetric): ChannelMetricsMap {
  const result: ChannelMetricsMap = {};
  for (const group of channelGroups) {
    const metricsMap: Record<string, Record<string, number>> = {};
    for (const metric of group.metrics) {
      const periodMap: Record<string, number> = {};
      if (metric === 'Output Metric') {
        // One value per quarter (keyed by quarter name), P13 blank
        for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
          periodMap[q] = generateMetricValue(metric, outputMetric);
          // Add trend value (percentage change)
          periodMap[`${q}_trend`] = randomVal(-25, 35, 1);
        }
      } else {
        for (let i = 1; i <= 13; i++) {
          periodMap[`P${i}`] = generateMetricValue(metric, outputMetric);
        }
      }
      metricsMap[metric] = periodMap;
    }
    result[group.name] = metricsMap;
  }
  return result;
}
