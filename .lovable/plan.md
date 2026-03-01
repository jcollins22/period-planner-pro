

## Plan: Fix Template to Match Exact App Schema + Rename "Actual Spend"

### Two changes

**1. Rename "Actual Spend" to "Essential Spend (non working)" everywhere**

Files affected:
- `src/components/ReportTable.tsx` -- update `allInputCols`, `inputKeyMap`, `inputTrendMap`, `dollarInputs`
- `src/data/reportData.ts` -- update `RowData` field names (`actualSpend` -> `essentialSpend`, `actualSpendTrend` -> `essentialSpendTrend`) and all references in `generateRow`, `computeTotals`
- `src/lib/excel/templateDownload.ts` -- use new metric name in template
- `src/lib/excel/loadExcel.ts` -- if the parser maps by metric name, update there too

**2. Expand the Channels sheet in the template to include ALL 24 channels across all 4 groups**

Update `src/lib/excel/templateDownload.ts` to generate rows for every group/channel/metric combination:

| Group | Channels (exact names from app) |
|-------|-------------------------------|
| Base | Other Base Features, Competitor Average Price, Competitor TDP, Inflation, Seasonality, Temperature, Average Price, Change of TDP, Trade (Feature & Display), Promo |
| Social | Owned + Paid, In-house Influencers, PR Box, Adfairy, Kale, New Social Channel, Essential Spend - Non Working |
| Experiential Marketing | Samples At/Near Store, Samples Away from Store, Samples at Event, Essential Spend - Non Working |
| Shopper Marketing | Shopper Tactic 1, Shopper Tactic 2, Shopper Tactic 3 |

17 metrics per channel (with "Essential Spend (non working)" replacing "Actual Spend"):
Planned Spend, Essential Spend (non working), Working Spend, Impressions, Samples, CPM & CPP, Coverage Factor, NSV Number, MAC Number, % Contribution, Volume, Scaled Volume, NSV $, GSV, NSV ROI, MAC ROI, Effectiveness

Total: 24 channels x 17 metrics = 408 data rows + 1 header row.

### Technical approach

- Define the channel structure as a constant array in `templateDownload.ts`
- Loop through groups, channels, and metrics to programmatically generate all rows with sample values
- Use a helper function that varies sample values slightly per channel so the data is distinguishable
- Consumption and Period sheets remain unchanged

