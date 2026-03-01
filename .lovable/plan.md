

## Plan: Fix Blank Template and Confirm Offline-Ready Architecture

### Problem 1: Template Contains Sample Data

The download template (`src/lib/excel/templateDownload.ts`) has hardcoded non-zero values throughout -- both the `sampleValues()` function for Channels (line 44-48) and all the hardcoded arrays for Consumption (lines 88-164). When you download and re-upload this template, those numbers show up in the dashboard.

**Fix:** Replace all sample values with zeros so the template is truly blank:

- **Channels sheet**: Change `sampleValues()` to return an array of 13 zeros instead of computed numbers.
- **Consumption sheet**: Replace all hardcoded value arrays (salesTotalVals, salesFrozenVals, velTotalVals, hhTotal, rrTotal, dphTotal, etc.) with arrays of 13 zeros.
- Remove the `splitSample()` helper since it's no longer needed (splitting zero by ratios is just zero).

This means the template will have the correct structure (headers, metric names, group/channel combinations) but all period values will be 0, ready for the user to fill in.

### Problem 2: Offline / No Backend Confirmation

After searching the codebase, **all computations already run entirely in the browser**:
- Excel parsing uses the `xlsx` library client-side (`src/lib/excel/loadExcel.ts`)
- All trend calculations, aggregations, and data transformations happen in `src/lib/data/selectors.ts`
- State management uses React Context (`src/state/dataStore.ts`)
- There are zero `fetch()`, `axios`, `supabase`, or API calls anywhere in the source code
- The app is a Vite + React SPA that can be built as static files

No changes needed for offline capability -- the app is already fully client-side.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/excel/templateDownload.ts` | Zero out all sample data, remove `splitSample` helper |

### What Won't Change

- Template still has all correct headers, metric names, group/channel labels, and sheet structure
- The mock data fallback (shown when no file is loaded) remains as-is -- it only appears when `workbook` is null
