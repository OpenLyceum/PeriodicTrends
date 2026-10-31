# PeriodicTrends follow-up functional review — 2026-10-31

**Resolution:** all three findings below have been fixed and covered by regressions. The
original reproductions and locations are retained; the fixes and final validation follow below.

Reviewed `main` at `6e8f14f690f40ad06d453736e16e8ffd0ace2182` after
`git pull --ff-only` reported **Already up to date**. The initial working tree was clean.
Runtime: Node v26.13.0 in WSL Ubuntu-24.04 (Ubuntu 26.04.1), satisfying Node >=26.

Scope: verify the six earlier fixes, review explanation consistency with the calculated
Slater values, extended-table selections, shielding calculations and layout, localization,
accessible table descriptions, and development/production startup. Applied Baton's
`scenerystack-code-review` skill and functional-review reference. This is a targeted
functional review, not a complete release audit or an independent audit of every data value.

## Findings

### 1. [P2] Period explanations claim increasing charge and constant n when the selected data disagree

Location: `src/trends/view/describeSelection.ts:128–147`, especially the unconditional
period template and `n: valenceN(first.z)`; `trends.period` and
`trends.consequence.period.zEff` in the three locale files.

The explanation always says effective nuclear charge rises across a period, every added
electron joins the same shell, and the outer electron's n stays at the first element's n.
These statements are false for supported ground-state configuration exceptions. The chart
and the shielding calculations use the actual configurations, so the explanation visibly
contradicts the measurements it is supposed to explain.

Reproduced with an actual focused-table Shift+Right commit after establishing the first
element as the selection:

- Default table, effective nuclear charge, V → Cr: the graph falls from **3.30 to 2.95**,
  but the panel says **“Z_eff rises from 3.30 to 2.95”**, followed by its generic claim that
  the 3d series rises by 0.15 per element. There are no anomaly notes for this property.
- Extended table, effective nuclear charge, Pd → Ag: the graph falls from **6.85 to 3.70**,
  but the panel says **“n stays 4”** and **“Z_eff rises from 6.85 to 3.70.”** Its own
  `valenceN` returns **4 for Pd and 5 for Ag**. There are no anomaly notes here either.

The selected values are consistent with the model's chosen configurations; this finding
concerns the explanatory text, not a request to alter the correct Pd shielding fix. Check the
selected elements' n and charge changes before choosing the story, qualify the broad trend,
and explain configuration/target changes when the simple same-shell story does not apply.
Cover both a default-table reversal and the Pd → Ag shell change in display-level tests.

Screenshot evidence: `periodic-second-vanadium-chromium.png` and
`periodic-second-palladium-silver.png` in the session workspace.

### 2. [P3] Spanish Slater-table columns exceed their allocated width and overlap the electron panel

Location: `src/shielding/view/SlaterBreakdownNode.ts:36–40,46–51,79`; placement in
`src/shielding/view/ShieldingScreenView.ts`.

Reproduction: open `?screens=2&ea&locale=es` with the default krypton extent and chlorine.
The **“Apantallamiento”** column heading extends under the adjacent **“Electrón estudiado”**
panel and is visibly clipped. This needs no unusual element, preference or string-stress mode.

Measured in the screen's layout coordinates: the Slater panel starts at **450** and ends at
**828.04**, while the adjacent panel begins at **779**, an overlap of **49.04**. The screenshot
confirms that this is a visible overlap rather than only a conservative bounds calculation.
The same horizontal overlap was observed for all 557 occupied-element/target combinations
in the Spanish extended-table probe; English and French passed that geometry probe.

The four-column GridBox permits each cell up to `contentWidth / 3`, then adds three 14-unit
gaps; its total width is unconstrained, while the panel only has a minimum width. Allocate
column widths and gaps within the available content width, wrapping/scaling headings as
needed. Verify ordinary Spanish at all three extents and after a runtime locale change.

Screenshot evidence: `periodic-second-spanish-shielding.png` in the session workspace.

### 3. [P3] Extended tables retain accessible labels and a screen summary that stop at krypton

Location: `src/trends/view/PeriodicTableNode.ts:110`,
`src/shielding/view/ElementPickerNode.ts:44`,
`src/trends/view/TrendsScreenSummaryContent.ts:26`, and the corresponding localized
`a11y.trends.table`, `a11y.trends.screenSummary.playArea`, `a11y.shielding.picker` strings.

Reproduction on each screen: open the actual Preferences dialog, choose Simulation, select
**Through radon (Z = 1–86, with the lanthanides)**, and close it. The model reports
`maxZ = 86` and the visible table contains the extra elements, but the focused PDOM controls
still read **“Periodic table, hydrogen to krypton”** and **“Element picker, hydrogen to
krypton.”** The Trends play-area summary also still says hydrogen to krypton. The Xe extent
uses those same fixed strings.

These are the control's actual PDOM labels and the screen-summary paragraph, not just unused
translation keys. The accessible description understates the range available to a keyboard
or screen-reader user. Derive these localized descriptions from the current extent, or use
accurate extent-independent wording. Test startup and live extent changes on both screens.
The earlier graph-title fix correctly updates the visual overview title and does not cover
these separate descriptions.

## Initial review validation

- `npm run lint`: passed, 74 files checked, no fixes applied.
- `npm run check`: passed app, scripts and test type checks.
- `npm test`: **94 passed** across 6 files, including 5 memory checks.
- `npm run build`: passed production and PWA build.
- `FUZZ_PORT=5230 npx playwright test tests/browser`: **11 passed**, verifying the earlier
  fixes for Pd, keyboard extension, mouse/touch rings, Preferences layout, Explain/reset and
  all three localized overview titles.
- `FUZZ_PORT=5231 npm run test:fuzz:quick`: **2 passed**, pointer and keyboard, 10 seconds each.
- Fleet compliance and template drift checks: passed, including the compliance script's
  remote repository security-setting probes.
- Development Chromium probes with `?ea`: all 86 shielding elements and all their occupied
  target groups (**557 combinations per locale**, English/French/Spanish), without page errors.
  Measured horizontal panel separation and lower-screen bounds; Spanish overlap is finding 2.
- Development startup with `?ea&listenerOrder=random`: both screens traversed all 86 elements
  and reset without page/console errors. This was deterministic traversal, not randomized fuzz.
- Production preview on port 5233: both screens started with assertions enabled and the
  radon extent in English, French and Spanish without page/console errors.
- Inspected screenshots of the Spanish overlap and the Pd → Ag explanation. Native Preferences
  and table keyboard actions confirmed findings 1 and 3 through their real input callbacks.

## Scope and limitations

Application sources and tests were unchanged during the initial review, with this report its
only repository addition. No commits, pushes or external issues were made during that initial
review. Short fuzz is smoke coverage. Automated PDOM inspection does not establish manual
screen-reader sign-off. The
memory suite exercises `AnomalyBadge`; this review did not perform heap snapshots or establish
full screen/model disposal coverage. Educator approval and independent verification of every
tabulated experimental value remain outside scope.

## Resolution — 2026-10-31

1. The ordinary same-shell explanation is now limited to regular s/p runs with constant n and
   nondecreasing Slater Z_eff. Runs containing d/f elements show the actual endpoint target
   groups and principal quantum numbers and describe the estimate as changing. The Z_eff
   explanation identifies orbital-dependent Slater estimates and configuration exceptions;
   experimental-property text qualifies the broad trend separately from the selected values.
   English, French and Spanish templates were updated. Pd's configuration, shielding arithmetic
   and tabulated property data are preserved.
2. The complete Slater GridBox now has a maximum width matching the allocated middle-column
   content. Its headings, swatches and values scale together and remain aligned. In a Spanish
   traversal of all 557 occupied element/target combinations, the panel's maximum width was
   305 layout units including margins/stroke, with at least 24 units of horizontal clearance
   from the neighboring electron panel. Inspected Spanish screenshots confirm readable,
   unobscured headings and the corrected Pd → Ag text.
3. Both table labels and the Trends play-area summary now derive their localized endpoint
   name from the current extent. Regression checks cover Kr/Xe/Rn at startup and after live
   changes on both screens in all locales, native Preferences changes, and runtime language
   changes (including Xenon/Xénon/Xenón).

Final fuzz also exposed a related, pre-existing extent/reset defect (pointer seed **863016**):
`SelectedElementModel.reset()` called `NumberProperty.reset()`, restoring the startup atomic-
number range even when the current table preference had changed. An expanded table could then
reject visible elements above Z = 36. Reset now establishes Cl and the current table range
together. Two unit regressions failed against the old reset after expansion and shrinking;
the browser regression exercises actual Preferences, Reset All, and keyboard selection through
Br/I/At to Rn with assertions enabled.

Final validation on Node v26.13.0:

- `npm run lint`: passed, 78 files checked, no findings.
- `npm run check`: passed app, scripts and test type checks.
- `npm test`: **101 passed** across 8 files, including the existing memory suite.
- `npm run build`: passed production/PWA build.
- `FUZZ_PORT=5230 npx playwright test tests/browser`: **24 passed**, including all 11 earlier
  regressions, 12 follow-up cases, and the reset/extent regression.
- `FUZZ_PORT=5231 FUZZ_SEED=863016 npm run test:fuzz:quick`: **2 passed**, pointer and
  keyboard, replaying the seed that exposed the reset defect.
- Fleet compliance and template drift checks: passed, including remote security-setting probes.
- English, French and Spanish Pd → Ag screenshots and the Spanish shielding screenshot were
  inspected; the deterministic visual probe completed without page errors.
