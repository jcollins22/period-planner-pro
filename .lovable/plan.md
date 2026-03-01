

## Plan: Rename "Total Repeat Rate" and Add Frozen/FD Breakdown to Non-Drillable Metrics

### 1. Rename "Total Repeat Rate" to "Repeat Rate"

Update the label string in all 6 files where it appears:

- `src/data/consumptionData.ts` (lines 87, 101, 115)
- `src/lib/excel/templateDownload.ts` (line 143)
- `src/lib/data/selectors.ts` (line 209)
- `src/components/ConsumptionTiles.tsx` (lines 13, 21)
- `src/components/ConsumptionMetricsTable.tsx` (lines 23, 35)
- `src/components/ChannelMetricsTable.tsx` (lines 41, 55)

### 2. Add Frozen/FD Rows to Template for HH Penetration, Repeat Rate, $/Household

Currently the download template only has a single "Total" row for these three metrics. Add Frozen and FD rows (with values summing to Total) for each:

In `src/lib/excel/templateDownload.ts`, after each Total row, add:
- `['HH Penetration', 'Frozen', '', '', ...]` and `['HH Penetration', 'FD', '', '', ...]` (values split from the total)
- Same for `Repeat Rate` and `$/Household`

These metrics remain **non-drillable** (no Type/Package breakouts) -- they just get the Frozen/FD split that the UI already supports and displays.

### Files Changed

| File | Change |
|------|--------|
| `src/data/consumptionData.ts` | Rename label |
| `src/lib/excel/templateDownload.ts` | Rename label + add Frozen/FD rows for 3 metrics |
| `src/lib/data/selectors.ts` | Rename label |
| `src/components/ConsumptionTiles.tsx` | Rename in formatters |
| `src/components/ConsumptionMetricsTable.tsx` | Rename in config and formatter |
| `src/components/ChannelMetricsTable.tsx` | Rename in config and formatter |

