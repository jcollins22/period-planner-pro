

## Plan: Group Totals + Executive Consumption Tiles

This plan covers two major additions to the main report page:

---

### Part 1: Group Summary Totals on Collapsed Rows

**What changes:** The group header rows (Base, Social, Experiential Marketing, Shopper Marketing) will display summed totals across all their child rows for every visible column. These totals remain visible even when the group is collapsed.

**Technical approach:**

**`src/data/reportData.ts`**
- Add a `totals` field to the `RowGroup` interface containing a single `RowData` object
- In `generateReportData`, after generating each group's rows, compute the `totals` by summing all numeric fields across the child rows (spend, impressions, samples, outputs, etc.) and averaging trend percentages

**`src/components/ReportTable.tsx`**
- Change the group header row from a single `colSpan` cell to render actual data cells (same as a data row) alongside the group name
- The group name cell keeps the chevron toggle; the remaining cells show the summed totals using the same formatting logic (`formatDollar`, `formatNum`, `formatPct`)
- Style the totals row with bold font on a slightly different background to distinguish it from child rows

---

### Part 2: Executive Consumption Tiles

**What changes:** Five horizontal KPI tiles appear above the report table showing: Sales, Velocity, Household Penetration, Total Repeat Rate, and Dollars/Household. Each tile shows a total value with a trend percentage, plus a Frozen/FD split beneath in two different colors. Clicking Sales or Velocity expands a drill-down showing Frozen split into Core and Greek, and FD split into Core and Creme.

**New files:**

**`src/data/consumptionData.ts`**
- Define an interface `ConsumptionTile` with fields: `total`, `trend`, `frozen`, `frozenTrend`, `fd`, `fdTrend`
- For Sales and Velocity tiles, add sub-splits: `frozenCore`, `frozenGreek`, `fdCore`, `fdCreme` (each with value + trend)
- Export a `generateConsumptionData(period, trendMode)` function that returns mock data for all 5 tiles, using seeded random values that change with period/trendMode

**`src/components/ConsumptionTiles.tsx`**
- New component receiving `period`, `trendMode` props
- Renders 5 tiles in a horizontal flex row (`flex gap-3`), each as a compact card
- Each tile shows:
  - Title (e.g., "Sales") at the top in small bold text
  - Total value prominently with trend percentage color-coded (emerald/red)
  - Below the total: two small bars or chips for "Frozen" (blue tint) and "FD" (amber tint) with their values
- Sales and Velocity tiles are clickable (cursor-pointer, subtle hover effect)
- Clicking toggles an expanded state showing a small sub-breakdown beneath:
  - Frozen row splits into "Core" and "Greek" values
  - FD row splits into "Core" and "Creme" values
- Uses existing Card component for consistent styling
- Tiles are responsive -- on smaller screens they can wrap or shrink

**`src/pages/Index.tsx`**
- Import and render `ConsumptionTiles` between the `PeriodSelector` and `ReportTable`
- Pass `period` and `trendMode` as props so tile data reacts to filter changes

---

### Summary of files to create/modify

| File | Action |
|------|--------|
| `src/data/reportData.ts` | Add `totals` to `RowGroup`, compute sums in `generateReportData` |
| `src/components/ReportTable.tsx` | Render group totals inline on header rows instead of single colSpan |
| `src/data/consumptionData.ts` | New -- mock data generator for 5 consumption tiles |
| `src/components/ConsumptionTiles.tsx` | New -- 5 horizontal KPI tiles with Frozen/FD split and drill-down |
| `src/pages/Index.tsx` | Add `ConsumptionTiles` between selector and table |

