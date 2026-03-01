

## Plan: Update HH Penetration, Repeat Rate, and $/Household Display Logic

### Summary

Three changes to how non-drillable consumption metrics behave:

1. **Trend unit for HH Penetration and Repeat Rate**: Show trends in "pp" (percentage points = absolute difference) instead of "%" (relative change). E.g., 20% to 22% = "+2.0pp" not "+10.0%".
2. **Frozen/FD are independent values**: For all three non-drillable metrics, Frozen and FD are their own standalone measurements -- they do NOT sum to the Total. E.g., Total HH Pen = 20%, Frozen HH Pen = 15%, FD HH Pen = 12%.
3. **$/Household** follows the same independent logic -- Frozen and FD are their own dollar amounts, not splits of the total.

### Files to Change

**1. `src/data/consumptionData.ts` -- Generate independent Frozen/FD values**

- In `generateConsumptionData`, for non-drillable metrics (HH Penetration, Repeat Rate, $/Household): generate Frozen and FD as independent random values in the same range as Total, NOT as splits of Total.
- In `generateConsumptionPeriodData`, same change: Frozen and FD get their own independent values per period.
- For HH Penetration and Repeat Rate trends: compute as absolute difference (pp) instead of percentage change.

**2. `src/components/ConsumptionTiles.tsx` -- Show "pp" for trend badges**

- Update `TrendBadge` to accept an optional unit prop or pass metric context.
- For HH Penetration and Repeat Rate, display trends with "pp" suffix instead of "%".
- $/Household trends remain as "%" (relative change) since they are dollar values.

**3. `src/lib/data/selectors.ts` -- Compute pp trends from uploaded data**

- In `selectConsumptionTiles`: for HH Penetration and Repeat Rate, compute trend as `current - previous` (percentage points) instead of `(current - previous) / previous * 100`.
- This applies to Total, Frozen, and FD trend values for these two metrics.

**4. `src/components/ConsumptionMetricsTable.tsx` -- No structural changes needed**

- The table shows raw period values, not trends, so no format changes required here.

**5. `src/lib/excel/templateDownload.ts` -- Update sample data**

- For HH Penetration, Repeat Rate, and $/Household: change Frozen and FD sample values to be independent (not summing to Total). E.g., Total = 25.0%, Frozen = 18.5%, FD = 14.2%.

### Technical Detail: pp Trend Computation

Current `computeTrend` uses relative change: `(cur - prev) / |prev| * 100`

For pp metrics, the trend is simply: `cur - prev` (already in percentage-point units).

A new helper `computePpTrend(current, previous)` returns `Number((current - previous).toFixed(1))` and is used for HH Penetration and Repeat Rate in both the mock data generator and the selector.

