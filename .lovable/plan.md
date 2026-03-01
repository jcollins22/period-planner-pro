## Plan: Update Consumption Metrics Breakout Structure

### Summary

Replace the current single breakout (Core/Greek under Frozen, Core/Creme under FD) with two parallel breakout dimensions for Sales and Velocity: **Type** and **Package**. Each breakout sums to its parent (Frozen or FD). No changes to HH Penetration, Total Repeat Rate, or $/Household.

### New Hierarchy (Sales and Velocity)

```text
Sales (Total)
  Frozen
    By Type: Milk, Dark, Greek  (each sums to Frozen total)
    By Package: 8oz, 18oz, 24oz (each sums to Frozen total)
  FD
    By Type: Milk, Dark, Creme    (each sums to FD total)
    By Package: 1.7oz, 3.4oz, 6.5oz (each sums to FD total)

Velocity (same structure as Sales)
```

### Files to Change

**1. `src/lib/excel/excelSchema.ts` -- Add Level 3 column**

- Add `level3: string` to `ConsumptionRow` to support the new dimension: Level 1 = Frozen/FD/Total, Level 2 = Type/Package (breakout category), Level 3 = the specific item (Milk, 8oz, etc.)
- For Total/Frozen/FD aggregate rows, Level 2 and Level 3 remain empty

**2. `src/lib/excel/loadExcel.ts` -- Parse Level 3**

- Read `Level 3` column from the Consumption sheet into `row.level3`

**3. `src/lib/excel/templateDownload.ts` -- Update sample data**

- Update Consumption sheet headers to include `Level 3`
- Replace old Core/Greek/Creme rows with new breakout rows for both Sales and Velocity:
  - `['Sales', 'Frozen', 'Type', 'Milk', ...]`, `['Sales', 'Frozen', 'Type', 'Dark', ...]`, `['Sales', 'Frozen', 'Type', 'Greek', ...]`
  - `['Sales', 'Frozen', 'Package', '8oz', ...]`, etc.
  - Same pattern for FD (with Creme instead of Greek, and 1.7oz/3.4oz/6.5oz)
  - Same pattern repeated for Velocity
- Ensure sample values for each breakout group sum to parent

**4. `src/data/consumptionData.ts` -- Update interfaces and generators**

- Replace `frozenCore/frozenGreek/fdCore/fdCreme` with new structure:
  ```
  frozenTypeBreakout?: { label: string; value: number; trend: number }[]
  frozenPackageBreakout?: { label: string; value: number; trend: number }[]
  fdTypeBreakout?: { label: string; value: number; trend: number }[]
  fdPackageBreakout?: { label: string; value: number; trend: number }[]
  ```
- Update `generateConsumptionData` to generate 3-item breakouts for each dimension (Frozen Type: Milk/Dark/Greek, Frozen Package: 8oz/18oz/24oz, FD Type: Milk/Dark/Creme, FD Package: 1.7oz/3.4oz/6.5oz)
- Update `generateConsumptionPeriodData` to produce rows keyed like `Frozen Type Milk`, `Frozen Package 8oz`, `FD Type Creme`, etc.

**5. `src/components/ConsumptionTiles.tsx` -- Update expanded UI**

- When expanded, show two breakout sections under each of Frozen and FD:
  - "By Type" row with 3 items (e.g., Milk, Dark, Greek)
  - "By Package" row with 3 items (e.g., 8oz, 18oz, 24oz)
- Use a 3-column grid instead of the current 2-column grid for each breakout group
- Add small "Type" and "Package" labels above each breakout row

**6. `src/components/ConsumptionMetricsTable.tsx` -- Update row hierarchy**

- For drillable metrics, when Frozen/FD is expanded, show two expandable sub-groups: "By Type" and "By Package"
- Under "By Type": leaf rows for each type item (Milk, Dark, Greek/Creme)
- Under "By Package": leaf rows for each package size
- Adds a 4th indent level, so expand state tracking needs another level
- Row keys: e.g., `Sales-Frozen-Type`, `Sales-Frozen-Type-Milk`, `Sales-Frozen-Package-8oz`

**7. `src/lib/data/selectors.ts` -- Update consumption selectors**

- `selectConsumptionTiles`: Look up breakout items using the new Level 2 (Type/Package) and Level 3 (item name) structure instead of the old Level 2 (Core/Greek/Creme)
- `selectConsumptionPeriodData`: Build row names like `Frozen Type Milk`, `FD Package 3.4oz` from Level 1 + Level 2 + Level 3

### What stays the same

- HH Penetration, Total Repeat Rate, $/Household remain non-drillable with just Frozen/FD split
- Channel Metrics page also needs to update to show the same format breakdowns with collapseable sections
- Main report table is unaffected