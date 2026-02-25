

## Plan: Excel Workbook Loading

Replace random-data generation with real data loaded from a 6-sheet Excel workbook (.xlsx). Add a file upload control, parsing/validation layer, centralized data store, and selector functions that feed existing components.

---

### Sheet Structures

**Q1, Q2, Q3, Q4 sheets** (quarterly report data)
- 2-row header: Row 1 has metric names (some cells blank, fill-forward), Row 2 has repeating "Q" and "QoQ" sub-headers
- First column is "Channel"
- Parse into flat column names like `Metric__Q` and `Metric__QoQ`
- Each subsequent row is a channel with its data values

**Consumption sheet**
- Columns: Metric, Level 1, Level 2, P1, P2, ..., P13
- Metric = top-level name (Sales, Velocity, etc.)
- Level 1 = segment (Total, Frozen, FD)
- Level 2 = sub-segment (Core, Greek, Creme, or blank)

**Period sheet**
- Columns: Channel, Metric, P1, P2, ..., P13
- Each row is a channel + metric combination with period values

---

### New Files

#### `src/lib/excel/excelSchema.ts`
- TypeScript types for each parsed sheet structure
- `QuarterRow`: `{ channel: string; [metricKey: string]: number | string }` where keys are like `PlannedSpend__Q`, `PlannedSpend__QoQ`
- `ConsumptionRow`: `{ metric: string; level1: string; level2: string; [period: string]: number | string }`
- `PeriodRow`: `{ channel: string; metric: string; [period: string]: number | string }`
- `ParsedWorkbook`: `{ q1: QuarterRow[]; q2: QuarterRow[]; q3: QuarterRow[]; q4: QuarterRow[]; consumption: ConsumptionRow[]; period: PeriodRow[] }`
- Validation function `validateWorkbook(wb: ParsedWorkbook): ValidationError[]` that checks:
  - All 6 required sheets present
  - Required columns exist
  - Numeric fields are actually numbers
  - Returns array of `{ sheet: string; row?: number; message: string }`

#### `src/lib/excel/loadExcel.ts`
- Install `xlsx` package
- `parseExcelFile(file: File): Promise<ParsedWorkbook>` function
- For Q1-Q4 sheets:
  - Read as array-of-arrays (`header: 1`)
  - Row 0 = metric names (fill-forward blanks from left)
  - Row 1 = sub-headers ("Q", "QoQ")
  - Flatten into column keys: `${metricName}__${subHeader}`
  - Rows 2+ become data rows with `channel` from column 0
- For Consumption sheet:
  - Read normally, map columns Metric/Level 1/Level 2/P1..P13
- For Period sheet:
  - Read normally, map columns Channel/Metric/P1..P13
- Call `validateWorkbook()` and throw or return errors

#### `src/state/dataStore.ts`
- React context + provider pattern for global data state
- State shape:
  ```
  {
    workbook: ParsedWorkbook | null;
    status: 'empty' | 'loading' | 'loaded' | 'error';
    errors: ValidationError[];
    fileName: string | null;
  }
  ```
- `DataProvider` wraps the app in `App.tsx`
- `useDataStore()` hook returns state + `loadFile(file: File)` action
- `loadFile` sets status to 'loading', calls `parseExcelFile`, validates, updates state

#### `src/components/DataLoader.tsx`
- Compact UI control with:
  - "Load Excel (.xlsx)" button that triggers a hidden file input
  - Status indicator: empty (grey), loading (spinner), loaded (green check + filename), error (red)
  - If validation errors, show expandable error list below
  - "Clear" button to reset back to mock data
- Placed in the header area of both Index and ChannelMetrics pages

#### `src/lib/data/selectors.ts`
- Bridge functions that convert `ParsedWorkbook` data into the shapes expected by existing components
- `selectReportData(workbook, period, trendMode) -> RowGroup[]`:
  - Maps Q1-Q4 sheet rows to `RowData` objects using the `Metric__Q` / `Metric__QoQ` column convention
  - Groups channels into Base/Social/Experiential/Shopper (lookup by channel name)
  - Computes group totals same as current `computeTotals`
  - Falls back to `generateReportData()` if workbook is null
- `selectConsumptionTiles(workbook, period, trendMode) -> ConsumptionTileData[]`:
  - Aggregates Consumption sheet rows for the selected period into tile format
  - Sums across periods for quarters
  - Falls back to `generateConsumptionData()` if workbook is null
- `selectConsumptionPeriodData(workbook) -> ConsumptionPeriodData`:
  - Reshapes Consumption sheet into the nested record structure used by ChannelMetricsTable
  - Falls back to `generateConsumptionPeriodData()` if workbook is null
- `selectChannelMetricsData(workbook, outputMetric) -> ChannelMetricsMap`:
  - Maps Period sheet rows into the channel metrics structure
  - Falls back to `generateChannelMetricsData()` if workbook is null

---

### Modified Files

#### `src/App.tsx`
- Wrap routes with `DataProvider` from dataStore

#### `src/pages/Index.tsx`
- Add `DataLoader` component in the header area
- Replace `generateReportData` call with `selectReportData(workbook, period, trendMode)` using `useDataStore()`
- Replace `generateConsumptionData` in `ConsumptionTiles` similarly

#### `src/components/ReportTable.tsx`
- Accept optional `data` prop (RowGroup[]) instead of generating internally
- If not passed, fall back to `generateReportData` (backward compat during transition)

#### `src/components/ConsumptionTiles.tsx`
- Accept optional `data` prop (ConsumptionTileData[]) instead of generating internally
- Fall back to `generateConsumptionData` if not passed

#### `src/pages/ChannelMetrics.tsx`
- Add `DataLoader` in header
- Pass loaded data through to `ChannelMetricsTable`

#### `src/components/ChannelMetricsTable.tsx`
- Accept optional pre-parsed data props instead of calling generators directly
- Fall back to mock generators when no workbook loaded

---

### Implementation Order

1. Install `xlsx` package
2. Create `excelSchema.ts` (types + validation)
3. Create `loadExcel.ts` (parsing logic)
4. Create `dataStore.ts` (context + provider)
5. Create `selectors.ts` (data transformation bridge)
6. Create `DataLoader.tsx` (UI control)
7. Update `App.tsx` to add DataProvider
8. Update `ReportTable.tsx` and `ConsumptionTiles.tsx` to accept data props
9. Update `Index.tsx` to wire up store + selectors + DataLoader
10. Update `ChannelMetricsTable.tsx` and `ChannelMetrics.tsx` similarly

---

### Technical Notes

- The `xlsx` library is used in browser mode (no Node.js file system needed) -- reads `File` objects via `FileReader` + `XLSX.read()`
- Fill-forward logic for Q sheet headers: iterate row 0 left-to-right, carrying forward the last non-empty cell value
- Column key sanitization: strip whitespace, replace spaces with camelCase or keep as-is to match existing `RowData` field names
- The selector layer maps Excel column names (e.g., "Planned Spend") to `RowData` keys (e.g., `plannedSpend`) using a lookup table
- All fallbacks to mock data ensure the app works identically without an Excel file loaded

