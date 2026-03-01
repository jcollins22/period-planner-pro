

## Plan: Rename Sub-Channels, Make Collapsible, and Enforce Quarter-Only Metrics

### Part 1: Rename and restructure Experiential Marketing and Shopper Marketing

Currently these two groups are single non-collapsible line items. Change them to be collapsible groups, each with a single sub-channel:

- **Experiential Marketing** group with one sub-channel named **"Experiential"**
- **Shopper Marketing** group with one sub-channel named **"Shopper"**

This means they behave like Base and Social -- a collapsible header row showing totals, with a child row underneath.

### Part 2: Quarter-only metrics

The following 5 output metrics should only show data when viewing a quarter (Q1-Q4). When viewing a period (P1-P13), these metrics should be `undefined` (displayed as "---"):

- % Contribution
- NSV $
- GSV
- NSV ROI
- MAC ROI

Note: Volume, Scaled Volume, and Effectiveness are NOT in this list and will remain available for both periods and quarters.

### Files to update

**1. `src/data/reportData.ts`**
- Change Experiential Marketing: `rows: [generateRow('Experiential', isQuarter, ...)]`, `collapsible: true`
- Change Shopper Marketing: `rows: [generateRow('Shopper', isQuarter, ...)]`, `collapsible: true`
- In `generateRow`, for the quarter-only metrics (% Contribution, NSV $, GSV, NSV ROI, MAC ROI): only generate values when `isQuarter` is true; set to `undefined` when it's a period

**2. `src/lib/excel/templateDownload.ts`**
- Change Experiential Marketing channels to `['Experiential']`
- Change Shopper Marketing channels to `['Shopper']`

**3. `src/lib/data/selectors.ts`**
- Remove the single-line detection logic (`isSingleLine` check) since these groups now have a named sub-channel different from the group name
- For quarter-only metrics: when `isQuarter` is false, skip populating the 5 quarter-only fields (leave them `undefined`) in `selectReportData`

**4. `src/components/ReportTable.tsx`**
- No changes needed -- collapsible behavior and "---" rendering already work correctly

### Quarter-only metric fields (for reference)

| Metric | Value field | Trend field |
|--------|------------|-------------|
| % Contribution | pctContribCurrent | pctContribQoQ |
| NSV $ | nsvDollarCurrent | nsvDollarQoQ |
| GSV | gsvCurrent | gsvQoQ |
| NSV ROI | nsvRoiCurrent | nsvRoiQoQ |
| MAC ROI | macRoiCurrent | macRoiQoQ |

