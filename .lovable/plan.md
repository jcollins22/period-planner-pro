## Plan: Add Consumption Metrics Table to Channel Metrics Page

Add a collapsible consumption metrics table connected to but below the existing channel metrics (Social, Shopper, Experiential) on the Period Breakdown page. This table reuses the same 5 consumption metrics and breakdowns from the main page but presents them in a period-based table format with hierarchical expand/collapse.

---

### Hierarchy Structure

**Sales** (collapsible)

- Frozen (collapsible)
  - Core
  - Greek
- FD (collapsible)
  - Core
  - Creme

**Velocity** (same structure as Sales)

**HH Penetration** (collapsible)

- Frozen
- FD

**Total Repeat Rate** (same as HH Penetration)

**$/Household** (same as HH Penetration)

---

### Data Layer: `src/data/consumptionData.ts`

- Add a new function `generateConsumptionPeriodData(trendMode: string)` that returns period-level data (P1-P13) for each metric and its sub-rows
- Reuse the existing seeded random utility and `ConsumptionTileData` interface pattern
- Return a structure like: `Record<metricLabel, Record<rowName, Record<period, number>>>` where rowName includes "Total", "Frozen", "FD", "Frozen Core", "Frozen Greek", "FD Core", "FD Creme"
- Data should vary based on `trendMode` to stay consistent with the rest of the app

### New Component: `src/components/ConsumptionMetricsTable.tsx`

- Renders a table with the same period column structure as `ChannelMetricsTable` (P1-P13 under Q1-Q4 headers)
- Left columns: Metric name with indent levels for hierarchy
- Each top-level metric row (Sales, Velocity, etc.) has a chevron toggle to expand/collapse
- For Sales and Velocity: expanding shows Frozen and FD rows, each of which is also expandable to show their sub-splits (Core/Greek or Core/Creme)
- For HH Penetration, Total Repeat Rate, $/Household: expanding shows just Frozen and FD
- Parent rows styled with bold text and subtle background; child rows indented
- Formatting follows the same rules as existing consumption tiles (dollar formatting for Sales, percentage for HH Penetration/Repeat Rate, dollar for $/Household, plain number for Velocity)

### Integration: `src/pages/ChannelMetrics.tsx`

- Import and render `ConsumptionMetricsTable` below `ChannelMetricsTable`
- Add a section heading like "Consumption Metrics" above it
- No additional filters needed -- the table uses its own seeded data

---

### Technical Details

**Files to create/modify:**


| File                                         | Action                                                    |
| -------------------------------------------- | --------------------------------------------------------- |
| `src/data/consumptionData.ts`                | Add `generateConsumptionPeriodData()` function            |
| `src/components/ConsumptionMetricsTable.tsx` | New -- hierarchical collapsible table with P1-P13 columns |
| `src/pages/ChannelMetrics.tsx`               | Import and render new table below existing one            |


**Collapse state management:**

- `useState` records tracking which metrics are expanded and which sub-levels (Frozen/FD) are expanded
- Structure: `expandedMetrics: Set<string>` for top-level, `expandedSubs: Set<string>` for Frozen/FD within Sales/Velocity

**Styling:**

- Match existing table styles (report-header, report-data-cell classes)
- Parent rows: bold, slightly darker background
- Sub-rows: indented with `pl-6`, sub-sub-rows with `pl-10`
- Chevron icons rotate on expand (ChevronRight / ChevronDown from lucide-react)