

## Plan: Simplify Channel Structure

### Changes

**1. Remove sub-channels from Experiential Marketing and Shopper Marketing**

Both groups will have no sub-rows -- they will appear as single-line groups with only totals (no expandable children).

**2. Remove "Essential Spend - Non Working" and "New Social Channel" from Social**

Social will keep 5 sub-channels: Owned + Paid, In-house Influencers, PR Box, Adfairy, Kale.

### Files to update

**`src/data/reportData.ts`** (report data generator)
- Social: remove `generateRow('New Social Channel', ...)` and `generateRow('Essential Spend - Non Working', ...)`
- Experiential Marketing: remove all 4 individual `generateRow(...)` calls, set `rows: []` and `collapsible: false`
- Shopper Marketing: remove all 3 individual `generateRow(...)` calls, set `rows: []` and `collapsible: false`

**`src/lib/excel/templateDownload.ts`** (template downloader)
- Social channels: remove "New Social Channel" and "Essential Spend - Non Working"
- Experiential Marketing: remove all sub-channels (empty array)
- Shopper Marketing: remove all sub-channels (empty array)
- This reduces template from 408 rows to: (10 + 5) channels x 17 metrics = 255 rows, plus Experiential and Shopper as group-level-only entries

**`src/components/ReportTable.tsx`** (if it references these channel names directly -- will verify during implementation)

### Result
- **Base**: 10 sub-channels (unchanged)
- **Social**: 5 sub-channels (Owned + Paid, In-house Influencers, PR Box, Adfairy, Kale)
- **Experiential Marketing**: no sub-channels, just a group-level row
- **Shopper Marketing**: no sub-channels, just a group-level row

