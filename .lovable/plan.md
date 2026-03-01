

## Plan: Two-Step Drill-Down on Consumption Tiles

### Current Behavior
Clicking a Sales or Velocity tile expands to show ALL breakouts (Frozen Type, Frozen Package, FD Type, FD Package) at once. This is cluttered.

### New Behavior
A progressive drill-down interaction on Sales and Velocity tiles:

1. **Step 1** -- Click on the **Frozen** or **FD** sub-card (not the whole tile). The clicked sub-card highlights and shows two buttons: "Type" and "Package".
2. **Step 2** -- Click "Type" or "Package" to reveal only that single breakout (3 items in a row).
3. Clicking a different sub-card or the same one again resets/collapses.

No changes to HH Penetration, Total Repeat Rate, or $/Household (they remain non-drillable). No changes to Channel Metrics page.

### Changes (single file: `src/components/ConsumptionTiles.tsx`)

**Replace the single `expanded` boolean state with a two-level state:**
- `activeSegment`: `null | 'frozen' | 'fd'` -- which sub-card is selected
- `activeBreakout`: `null | 'type' | 'package'` -- which breakout dimension is shown

**Make Frozen/FD sub-cards individually clickable (for drillable tiles only):**
- Add `onClick` handler to each sub-card div (with `e.stopPropagation()` to prevent tile-level click)
- On click: if already the active segment, reset both states to null; otherwise set `activeSegment` and reset `activeBreakout` to null
- Add visual indicator (slightly thicker border or ring) on the active sub-card

**Show breakout picker when a segment is selected but no breakout chosen:**
- Below the Frozen/FD row, show two small pill buttons: "Type" and "Package"
- Clicking one sets `activeBreakout` and reveals only that breakout section

**Show only the selected breakout:**
- Render a single `BreakoutSection` based on the combination of `activeSegment` + `activeBreakout`
- e.g., frozen + type shows `frozenTypeBreakout`, fd + package shows `fdPackageBreakout`

**Remove the old tile-level onClick for drillable tiles** -- interaction is now on the sub-cards only.

### Interaction Flow

```text
[Sales tile]
  Total: $2.3M  +4.2%
  [Frozen $1.4M] [FD $900K]     <-- click "Frozen"

  [Frozen $1.4M ✓] [FD $900K]   <-- Frozen highlighted
  [Type] [Package]               <-- pick one

  [Frozen $1.4M ✓] [FD $900K]
  By Type:
  [Milk $600K] [Dark $500K] [Greek $300K]
```

### Technical Details

- State: `useState<null | 'frozen' | 'fd'>(null)` and `useState<null | 'type' | 'package'>(null)`
- Sub-card click toggles segment; resets breakout
- Pill buttons styled as small rounded buttons with the segment's color scheme
- Active pill gets a filled background; inactive gets outline style
- The `BreakoutSection` component stays unchanged -- just conditionally rendered
- The chevron icon on drillable tiles is removed (no longer a single expand toggle)

