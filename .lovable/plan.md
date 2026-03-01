

## Plan: Remove Period Sheet and Source Channel Metrics from Channels Sheet

### Problem
The Period sheet duplicates data already available in the Channels sheet. The Channel Metrics page needs Working Spend, Impressions, Samples, and output metrics for Social, Shopper, and Experiential -- all of which exist in the Channels sheet.

### Mapping
The Channels sheet groups map to Channel Metrics sections:
- "Social" group (channels: Owned + Paid, In-house Influencers, etc.) -> aggregate to "Social"
- "Shopper Marketing" group (channel: Shopper) -> "Shopper"
- "Experiential Marketing" group (channel: Experiential) -> "Experiential"

Metrics map directly: Working Spend -> Working Spend, Impressions -> Impressions, Samples -> Samples. Output metrics (NSV ROI, MAC ROI, GSV, NSV $, Volume) are also in the Channels sheet and aggregate to quarter level.

### Changes

**1. `src/lib/data/selectors.ts` -- Rewrite `selectChannelMetricsData`**
- Remove dependency on `workbook.period`
- Instead, read from `workbook.channels`
- Filter to groups: Social, Experiential Marketing, Shopper Marketing
- For each group, sum all channels' metric values per period to get the group-level totals
- Map group names: "Shopper Marketing" -> "Shopper", "Experiential Marketing" -> "Experiential"
- For non-output metrics (Working Spend, Impressions, Samples): key by P1-P13
- For output metrics (the selected one, e.g. NSV ROI): aggregate P1-P3 into Q1, P4-P6 into Q2, etc., and compute trend vs previous quarter

**2. `src/lib/excel/templateDownload.ts` -- Remove Period sheet**
- Delete the Period sheet generation code (lines ~86-99)
- Remove it from the workbook entirely

**3. `src/lib/excel/excelSchema.ts` -- Remove PeriodRow and period references**
- Remove `PeriodRow` interface
- Remove `period` from `ParsedWorkbook`
- Remove Period sheet validation from `validateWorkbook`
- Remove 'Period' from `REQUIRED_SHEETS`

**4. `src/lib/excel/loadExcel.ts` -- Remove Period sheet parsing**
- Remove the code that parses the Period sheet into `PeriodRow[]`

**5. `src/state/dataStore.ts` -- No change expected**
- Verify it doesn't reference period data directly (it stores the full workbook)

### What stays the same
- The Channels and Consumption sheets remain unchanged
- The Channel Metrics UI component stays the same -- it consumes `ChannelMetricsMap` which keeps the same shape
- The fallback random data generator remains for when no file is uploaded

