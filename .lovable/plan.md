

## Plan: Add Template Excel Downloader

Add a "Download Template" button next to the existing "Load Data" button that generates and downloads a blank `.xlsx` file with the correct 3-sheet structure, headers, and example rows so you can see the exact format needed.

### What the template will contain

**Sheet 1: "Channels"**
- Headers: `Group | Channel | Metric | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13`
- 2 example rows showing the pattern:
  - `Base | Owned + Paid | Planned Spend | 1000 | 1100 | ... | 0`
  - `Base | Owned + Paid | Actual Spend | 950 | 1050 | ... | 0`
- All 17 metrics listed as a reference block below the examples (or as additional rows)

**Sheet 2: "Consumption"**
- Headers: `Metric | Level 1 | Level 2 | P1 | P2 | ... | P13`
- Example rows for each hierarchy level:
  - `Sales | Total | (blank) | 5000 | ...`
  - `Sales | Frozen | (blank) | 3000 | ...`
  - `Sales | Frozen | Core | 2000 | ...`
  - `Sales | Frozen | Greek | 1000 | ...`
  - `Sales | FD | (blank) | 2000 | ...`
  - `Sales | FD | Core | 1200 | ...`
  - `Sales | FD | Creme | 800 | ...`

**Sheet 3: "Period"**
- Headers: `Channel | Metric | P1 | P2 | ... | P13`
- Example rows:
  - `TV | Spend | 5000 | ...`
  - `TV | Impressions | 100000 | ...`

### Implementation

**New file: `src/lib/excel/templateDownload.ts`**
- Uses the `xlsx` library (already installed) to build a workbook in memory
- Creates the 3 sheets with headers and example data rows
- Triggers a browser download of the `.xlsx` file
- Exports a single function `downloadTemplate()`

**Modified file: `src/components/DataLoader.tsx`**
- Add a "Download Template" button (with a Download icon) visible in the `empty` state, next to the existing "Load Data" button
- Calls `downloadTemplate()` on click

### Technical Details
- Uses `XLSX.utils.aoa_to_sheet` to build sheets from arrays-of-arrays (headers + example rows)
- Uses `XLSX.writeFile` to trigger the browser download as `mmm-template.xlsx`
- The 17 channel metrics included as examples: Planned Spend, Actual Spend, Working Spend, Impressions, Samples, CPM & CPP, Coverage Factor, NSV Number, MAC Number, % Contribution, Volume, Scaled Volume, NSV $, GSV, NSV ROI, MAC ROI, Effectiveness
- The 5 consumption metrics: Sales, Velocity, HH Penetration, Total Repeat Rate, $/Household
- Group names shown: Base, Social, Experiential Marketing, Shopper Marketing

