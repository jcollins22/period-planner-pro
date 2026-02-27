

## Plan: Simplify Data Upload Format and Compute Trends in App

### Problem
The current Excel format requires 6 sheets with complex 2-row headers, and the user must pre-calculate QoQ/PoP trend values. This is unnecessarily complex.

### New Simplified Format

Replace the 6-sheet workbook with a **3-sheet** workbook. The user provides only raw values -- the app computes all QoQ and PoP trends automatically.

---

### Sheet 1: "Channels" (replaces Q1-Q4)

Simple flat table with a single header row:

| Group | Channel | Metric | P1 | P2 | ... | P13 |
|-------|---------|--------|-----|-----|-----|-----|

- **Group**: Base, Social, Experiential Marketing, Shopper Marketing
- **Channel**: e.g. "Owned + Paid", "PR Box", etc.
- **Metric**: One of the 17 metric names (Planned Spend, Actual Spend, Working Spend, Impressions, Samples, CPM & CPP, Coverage Factor, NSV Number, MAC Number, % Contribution, Volume, Scaled Volume, NSV $, GSV, NSV ROI, MAC ROI, Effectiveness)
- **P1-P13**: Raw numeric values per period

One row per Channel + Metric combination. No trends, no quarter aggregation needed from the user.

### Sheet 2: "Consumption" (same structure, simplified)

| Metric | Level 1 | Level 2 | P1 | P2 | ... | P13 |
|--------|---------|---------|-----|-----|-----|-----|

Same as current. No changes needed (already simple).

### Sheet 3: "Period" (same structure)

| Channel | Metric | P1 | P2 | ... | P13 |
|---------|--------|-----|-----|-----|-----|

Same as current. No changes needed.

---

### App-Computed Values

The application will calculate:

1. **Quarter aggregation**: Sum P1-P3 for Q1, P4-P6 for Q2, P7-P9 for Q3, P10-P12 for Q4
2. **QoQ trends**: `(currentQ - previousQ) / previousQ * 100` for the main report when viewing quarters
3. **PoP trends**: `(currentP - previousP) / previousP * 100` for the main report when viewing periods
4. **Group totals**: Sum/average across channels within a group (already done)
5. **Consumption tile aggregation**: Sum periods within selected quarter (already done)

---

### Technical Changes

#### 1. `src/lib/excel/excelSchema.ts`
- Remove `QuarterRow` type
- Add new `ChannelRow` type: `{ group: string; channel: string; metric: string; [period]: number }`
- Update `ParsedWorkbook`: replace `q1/q2/q3/q4` with single `channels: ChannelRow[]`
- Update validation to check for 3 required sheets: "Channels", "Consumption", "Period"

#### 2. `src/lib/excel/loadExcel.ts`
- Remove `parseQuarterSheet` with its complex fill-forward 2-row header logic
- Add simple `parseChannelsSheet` that reads a flat table with columns: Group, Channel, Metric, P1-P13
- Update `parseExcelFile` to look for "Channels" sheet instead of Q1-Q4
- Much simpler parsing -- standard `sheet_to_json` with single header row

#### 3. `src/lib/data/selectors.ts` (major rework)
- **New `computeTrend` helper**: `(current: number, previous: number) => percentage change`
- **Rework `selectReportData`**:
  - For a quarter (e.g. Q2): sum P4+P5+P6 for current values; sum P1+P2+P3 (previous quarter) for QoQ trend calculation
  - For a period (e.g. P5): use P5 value directly; compute PoP trend from P4
  - Group channels by the `group` column from the sheet (no more hardcoded channel-to-group mapping)
  - Build `RowData` objects with both values and computed trends
- **`selectConsumptionTiles`**: Add trend computation (compare current period/quarter vs previous)
- **`selectConsumptionPeriodData`**: No change needed (already period-level)
- **`selectChannelMetricsData`**: No change needed (already period-level)

#### 4. `src/components/DataLoader.tsx`
- Update status messages to reference new sheet names
- Update validation error display

#### 5. `src/state/dataStore.ts`
- Update type references from `ParsedWorkbook` (already uses it generically, minimal change)

---

### Trend Computation Logic (detail)

```text
Quarter view (e.g. Q2 selected):
  currentQ  = sum of metric across P4, P5, P6
  previousQ = sum of metric across P1, P2, P3
  QoQ trend = (currentQ - previousQ) / |previousQ| * 100
  Edge case: Q1 has no previous quarter -> trend = 0

Period view (e.g. P5 selected):
  currentP  = value at P5
  previousP = value at P4
  PoP trend = (currentP - previousP) / |previousP| * 100
  Edge case: P1 has no previous period -> trend = 0

Division by zero: if previousQ/previousP is 0, trend = 0
```

### Summary of Simplification

| Aspect | Before | After |
|--------|--------|-------|
| Number of sheets | 6 | 3 |
| Header complexity | 2-row fill-forward headers on Q sheets | Single-row headers everywhere |
| User provides trends? | Yes (QoQ columns required) | No (app computes them) |
| User provides quarter aggregates? | Yes (separate Q1-Q4 sheets) | No (app sums periods) |
| Channel grouping | Hardcoded lookup by channel name | Explicit "Group" column in data |
| Parsing complexity | Fill-forward logic + flattening | Simple `sheet_to_json` |

