

## Plan: Quarter-Level Columns for Output Metrics

### Problem
Metrics like % Contribution, Scaled Volume, NSV $, GSV, NSV ROI, and MAC ROI are MMM outputs that only exist at the quarter level. Currently the template forces users to enter them as P1-P13 period data, which the selectors then sum into quarters -- this is incorrect since these values aren't decomposable into periods.

### Solution
Change the template and parsing/selector logic so these metrics use Q1-Q4 columns instead of P1-P13.

### Quarter-Only Metrics
`% Contribution`, `Scaled Volume`, `NSV $`, `GSV`, `NSV ROI`, `MAC ROI`

### Changes

**1. `src/lib/excel/templateDownload.ts`**
- For quarter-only metrics, output columns `Q1, Q2, Q3, Q4` with zeros instead of `P1-P13`
- The Channels sheet header row becomes: `Group, Channel, Metric, P1..P13, Q1, Q2, Q3, Q4` (superset of both)
- Period-level metrics leave Q1-Q4 blank; quarter-only metrics leave P1-P13 blank

**2. `src/lib/excel/loadExcel.ts`**
- Update `parseChannelsSheet` to also read Q1-Q4 columns from each row (in addition to P1-P13)

**3. `src/lib/excel/excelSchema.ts`**
- `ChannelRow` interface already supports dynamic keys via `[period: string]: number | string`, so Q1-Q4 will work without type changes

**4. `src/lib/data/selectors.ts` -- `selectReportData`**
- For quarter-only metrics, read the value directly from the `Q1`/`Q2`/etc. key on the row instead of summing P1-P3
- Trend: compare current quarter value to previous quarter value directly
- Period view: continue showing `---` for these metrics (existing behavior)

**5. `src/lib/data/selectors.ts` -- `selectChannelMetricsData`**
- For output metrics (mapped via `outputMetricToChannelMetric`), read Q1-Q4 directly from the row instead of summing periods into quarters

### Template Layout Example (Channels sheet)

```text
Group | Channel | Metric         | P1 | P2 | ... | P13 | Q1 | Q2 | Q3 | Q4
Social| Owned   | Working Spend  | 0  | 0  | ... | 0   |    |    |    |
Social| Owned   | NSV ROI        |    |    | ... |     | 0  | 0  | 0  | 0
```

### Files Changed

| File | Change |
|------|--------|
| `src/lib/excel/templateDownload.ts` | Add Q1-Q4 headers; quarter-only metrics use Q columns, others use P columns |
| `src/lib/excel/loadExcel.ts` | Parse Q1-Q4 columns in addition to P1-P13 |
| `src/lib/data/selectors.ts` | Read Q1-Q4 directly for quarter-only metrics in both `selectReportData` and `selectChannelMetricsData` |

