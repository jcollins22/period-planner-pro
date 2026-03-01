

## Plan: Add Scaled Volume to Quarter-Only Metrics

Add `scaledVolCurrent` / `scaledVolQoQ` to the quarter-only metric list, matching the existing pattern for % Contribution, NSV $, GSV, NSV ROI, and MAC ROI.

### Files to update

**1. `src/data/reportData.ts`**
- In `generateRow`, change `scaledVolCurrent` and `scaledVolQoQ` to only populate when `quarterOnly` is true (currently they always populate)

**2. `src/lib/data/selectors.ts`**
- Add `scaledVolCurrent` to the `quarterOnlyFields` Set (line ~141) so it is skipped when viewing a period

No other files need changes.

