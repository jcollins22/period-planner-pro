

## Plan: Exclude Inapplicable Metrics Per Group

### Summary

Certain metrics do not apply to certain groups. The data generator and Excel template will be updated so those metrics are never populated or included.

### Metric exclusion rules

| Group | Excluded metrics |
|-------|-----------------|
| Base (all sub-channels) | Planned Spend, Essential Spend (non working), Working Spend, Impressions, Samples, CPM & CPP, NSV ROI, MAC ROI, Effectiveness |
| Social | Samples |
| Experiential Marketing | Impressions, Effectiveness |
| Shopper Marketing | Impressions, Samples, Effectiveness |

### Files to update

**1. `src/data/reportData.ts`**
- Modify `generateRow` to accept a list of excluded metric keys, and set those fields to `undefined`
- Pass the appropriate exclusions when calling `generateRow` for each group
- Update `computeTotals` so it naturally handles `undefined` values (it already does via the `?? 0` and filter patterns)

**2. `src/lib/excel/templateDownload.ts`**
- Define per-group metric exclusion lists
- When generating template rows, skip metric rows that are excluded for that group
- This reduces the total row count (Base loses 9 metrics per channel = 90 fewer rows, Social loses 1 per channel = 5, etc.)

**3. `src/components/ReportTable.tsx`**
- No structural changes needed -- cells with `undefined` values already render as "---" via the existing `formatNum`/`formatDollar`/`formatPct` helpers

