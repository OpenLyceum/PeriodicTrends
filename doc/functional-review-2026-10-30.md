# PeriodicTrends functional review — 2026-10-30

Reviewed commit: `bbd1e0f26c8840dd2d6767a569b44aa29499f00c` on `main`.

Scope: both screens; Slater-group selection and calculations; table selection, keyboard and
pointer controls; shared state and reset; table-extent changes; graph labels; English, French
and Spanish smoke checks; rebuild resource probes; standard automated gates. This review
originally recorded defects without changing application sources or committing/pushing changes.
The subsequent authorized fixes and validation are recorded under Resolution below.

## Findings

### 1. [P2] Palladium defaults to a core electron and gives the wrong valence effective charge

Location: `src/common/model/Slater.ts:79–81` (`outermostGroup`), consumed by
`PeriodicProperty.ts` and `ShieldingModel.ts`.

Reproduction: extend the table through Xe or Rn and select Pd (Z = 46). The default target is
`4sp`, S = 27.75 and Z_eff = 18.25. Selecting the occupied `4d` group explicitly instead gives
S = 39.15 and Z_eff = 6.85 under the sim's own Slater rules.

Cause: `outermostGroup` excludes every d/f group before choosing the last occupied group.
Palladium has no occupied 5s subshell, so this picks its filled 4s/4p core. NIST gives neutral Pd
as [Kr] 4d¹⁰ and singly ionized Pd as [Kr] 4d⁹:
[NIST atomic data for palladium](https://physics.nist.gov/PhysRefData/Handbook/Tables/palladiumtable1_a.htm).
For its 4d electron the independent arithmetic is S = 36 + 9 × 0.35 = 39.15,
Z_eff = 46 − 39.15 = 6.85.

Impact: the default atom, worked calculation, element readouts, and graph overlay all explain
a core electron as the valence electron. The 18.25 overlay also exceeds the graph's fixed
0–9 secondary axis and draws into the table above it.

Suggested correction: choose an occupied outer d group when there is no outer ns electron,
retaining the intended ns target for the other transition metals. Add a Pd default-target
regression and check both its graph value and shielding-screen initial choice.

### 2. [P2] Shift+arrow extension resets its moving endpoint to the anchor

Location: `src/trends/view/TrendsScreenView.ts:177–178`, interacting with
`src/trends/view/PeriodicTableNode.ts:358–361`.

Reproduction: focus the Trends periodic table on its initial Li cursor and repeatedly press
Shift+Right. Eight actual browser key presses produced selections:
Li–Be, Li–Be, Li–B, Li–Be, Li–Be, Li–B, Li–Be, Li–Be.
They should extend successively across period 2.

Cause: each changed selection triggers the screen's unconditional `moveCursorTo(anchorZ)`
listener, undoing the cursor advance made immediately before `commit`. A repeated unchanged
selection does not notify, which causes the observed oscillation.

Suggested correction: distinguish an external selection from the table's own extension so
the cursor remains at its moving endpoint. Cover repeated horizontal/vertical extension,
contraction, pointer selection followed by keys, and reset/extent changes during extension.

### 3. [P2] Inner atom rings cannot be selected by clicking them

Location: `src/shielding/view/ShellAtomNode.ts:97–99`.

Reproduction: select chlorine, then click the rightmost visible points of its 1s, 2sp and 3sp
rings. Actual pointer clicks at local radii 32, 66 and 100 all select `3sp`. The actual `(1s)`
radio button correctly selects `1s`, so this is a hit-area defect rather than a model limitation.

Cause: `ring.localBounds.dilated(...)` is a filled bounding rectangle, not the annular band
described by the comment. Each later, larger ring covers the earlier rings' click targets.
The touch area uses the same rectangle.

Suggested correction: use annular hit shapes with non-overlapping radial bands; verify every
occupied ring, including the more tightly packed rings in the extended table.

### 4. [P2] Expanding the table makes the electron choices overlap the colour legend

Location: `src/shielding/view/ShieldingScreenView.ts`, construction of `targetPanel` and
the one-time `legend.top = targetPanel.bottom + PANEL_SPACING` assignment.

Reproduction: open Shielding with the default Kr extent, then change its table-extent
preference to Rn. Before expansion the target panel ends at y = 150 and the legend begins at
y = 160 in layout coordinates. After expansion the target panel ends at y = 250, while the
legend still begins at y = 160: a 90 px overlap. A browser screenshot confirms the legend
covers the newly exposed lower radio buttons.

Cause: extent-dependent visibility grows the radio group, but the legend is positioned only
once. Starting directly with `?maxZ=86` lays out correctly, so startup-only tests miss this.

Suggested correction: lay out the panels reactively or in a shared VBox. Test preference
changes in both directions after the screen has been constructed.

### 5. [P2] Explain opens chlorine for the initial/reset lithium selection

Location: `src/trends/model/TrendsModel.ts:40–42,63–67` and the shared element initialization.

Reproduction in the ordinary two-screen sim: enter Trends and activate the actual
"Explain the selected element on the Shielding screen" button. The selection has anchorZ = 3
(Li, also shown in the card), but the shared element is Z = 17, so Shielding opens chlorine.
Repeat after Reset All: the same mismatch returns. Making an explicit element selection
first updates the shared element correctly.

Cause: construction and reset assign `selectionProperty` directly rather than synchronizing
its anchor with the shared element as `select()` does. The independent shared default is Cl.

Suggested correction: establish one consistent anchor/shared element at startup and reset.
Add a browser regression activating Explain immediately after each operation.

### 6. [P3] Extended-table graph titles still end at krypton

Location: `src/trends/view/TrendChartNode.ts:205` and `trends.allElementsTitle` in all locales.

Reproduction: open `?maxZ=86`, select Rn, and inspect the single-element overview graph. It
plots all 86 elements, labels Rn at the endpoint, and highlights Rn, but the title remains
"All elements, H → Kr". The French and Spanish titles also retain Kr. The Xe extent is
affected by the same fixed text.

Suggested correction: interpolate the last displayed element into the localized title and
test Kr/Xe/Rn plus a runtime extent change.

## Validation

- Runtime: WSL distribution registered as Ubuntu-24.04, Node v26.13.0.
- `npm run lint`: pass, no fixes applied.
- `npm run check`: pass for app, scripts and tests.
- `npm test`: 89 tests pass across 5 files, including the existing memory suite.
- `npm run build`: pass, including PWA generation.
- `FUZZ_PORT=5180 npm run test:fuzz:quick`: pointer and keyboard pass, 10 seconds per mode.
- `Baton/scripts/check-repo-compliance.sh PeriodicTrends`: pass, including remote security
  settings probes.
- `Baton/scripts/check-template-drift.sh PeriodicTrends`: pass.
- Deterministic Chromium probes: all six findings reproduced without application errors;
  ordinary arrow/Enter selection, P/G shortcuts and the shielding radio button worked.
- English/French/Spanish extended-table screenshots inspected. This was a locale smoke check,
  not an exhaustive translation or string-stress audit.
- Repeated property switches and shielding-element changes did not show continuing growth in
  the sampled global colour listener counts. No memory leak is asserted from child-node
  disposal inspection alone.

Limitations: this is a functional/source review, not educator approval, manual screen-reader
sign-off, or an independent audit of every tabulated experimental value. Fuzz is short smoke
coverage; it does not detect the semantic and hit-target defects above. No fixes, commits or
pushes were made during the initial review.

## Resolution — 2026-10-30

All six findings were addressed following the user's instruction to fix, commit and push on main:

1. The default electron comes from the last occupied Slater group. Pd now selects 4d and gives
   S = 39.15 and Z_eff = 6.85; its graph overlay stays inside the existing 0–9 axis.
2. The periodic table now owns cursor synchronization. Keyboard commits retain the moving
   endpoint; external selections, reset and extent changes clear obsolete extension anchors.
3. Ring pointer and touch targets are annuli, with reversed inner winding and radial bands
   bounded by neighboring ring midpoints.
4. The shielding legend follows the target panel's bounds when Preferences changes the extent.
5. Trends construction and reset synchronize the shared element with the default Li anchor.
   Explain also resynchronizes from the current visible selection after Shielding edits it.
6. The overview title interpolates the actual last element in English, French and Spanish.

Regression evidence: four new unit checks failed against the old behavior (Pd default/value,
Trends initialization and reset); the extent-shrink model check already passed. Browser
regressions for every finding also failed on the old code, including actual Preferences,
Explain, keyboard and ring inputs. The title assertion checks the rendered Scenery RichText
because its DOM representation splits the text into separate spans.

Follow-up validation on Node v26.13.0:

- 94 unit tests across 6 files pass.
- 11 browser regressions pass, including every occupied ring in Cl, Pd and Rn using mouse and
  touch, repeated keyboard extension/contraction, pointer-to-keyboard transitions, shrinking
  the extent during an extension, actual Preferences layout changes, Explain/reset and all
  three localized Kr/Xe/Rn overview titles.
- Lint, app/scripts/tests type checks, production/PWA build, compliance and template drift pass.
- Pointer and keyboard fuzz pass (10 seconds per mode, `FUZZ_PORT=5184`).
- Final screenshots confirm the correct Pd calculation, separated panels after runtime expansion,
  and the overview's H → Rn title with the Pd overlay inside the chart.
