

## Plan: Make Experiential Marketing and Shopper Marketing Single Line Items

### Problem

Since Experiential Marketing and Shopper Marketing have no sub-channels, they need their own data rows in the Channels sheet (using the group name as the Channel value). Currently:
- The template generates zero rows for these groups (empty `channels` arrays)
- The selector in `selectors.ts` skips groups with no rows (`if (!gRows || gRows.length === 0) continue`)
- The report data generator sets `rows: []` with no data

### Solution

Treat these two groups as having a single "self-named" channel -- the group name itself is the channel name.

### Files to update

**1. `src/lib/excel/templateDownload.ts`**
- For Experiential Marketing and Shopper Marketing, generate rows where Channel = Group name (e.g., Group="Experiential Marketing", Channel="Experiential Marketing")
- Apply their respective metric exclusions (Experiential excludes Impressions + Effectiveness; Shopper excludes Impressions + Samples + Effectiveness)
- This adds metric rows for these two groups to the template

**2. `src/data/reportData.ts`**
- Change Experiential Marketing to have `rows: [generateRow('Experiential Marketing', isQuarter, GROUP_EXCLUSIONS['Experiential Marketing'])]` and `collapsible: false`
- Change Shopper Marketing to have `rows: [generateRow('Shopper Marketing', isQuarter, GROUP_EXCLUSIONS['Shopper Marketing'])]` and `collapsible: false`
- This provides sample data when no Excel file is loaded

**3. `src/lib/data/selectors.ts`**
- Update `selectReportData` so that when a group has exactly one row whose channel name matches the group name, it is treated as a non-collapsible single-line group
- Set `collapsible: false` and use the single row's data directly as `totals` (instead of computing totals from sub-rows)
- Remove the `if (!gRows || gRows.length === 0) continue` skip so these groups always appear

### Result
- Template will include metric rows for Experiential Marketing and Shopper Marketing
- Both groups render as single non-collapsible rows in the report table
- Excluded metrics still show as "---"

