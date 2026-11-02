# AGENTS.md — Periodic Trends

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Periodic trends for **introductory (General) chemistry**, hydrogen to krypton by default (a
preference extends the table to xenon or radon): atomic radius,
first ionization energy, electron affinity and electronegativity, explained through effective
nuclear charge (Z_eff, Slater's rules) and the shell number n. It follows LightAndAtoms (light
and electronic structure) in the Gen Chem sequence. Two screens:

| Screen | Folder | Content |
|---|---|---|
| Trends | `src/trends/` | Heat-mapped table; click an element or drag across a period / down a group; graph of the property along the selection with Z_eff overlaid; "Why?" explanation with numbered anomaly notes |
| Shielding | `src/shielding/` | One atom drawn by Slater group; Slater's rules worked out line by line for a chosen electron; nuclear vs. felt charge |

Physics, data sources and the anomaly list: [`doc/model.md`](doc/model.md). Architecture and
design decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Z = 1–36 by default; 1–54 or 1–86 by preference.** The default table stops at krypton
  (periods 1–4 cover Gen Chem). A Preferences choice (or `?maxZ=54|86`) extends it through xenon
  or through radon; through radon, La–Lu sit in a detached row and the period-6 group-3 slot is a
  "57–71" placeholder that selects them (OpenStax layout; the lanthanides have `group: null`).
  `common/model/TableExtent.ts` owns every lookup that depends on what is shown (cells, periods,
  groups, colour scales); `ElementData` always holds all 86. Both are the user's choices.
- **Slater's rules only.** They are the method students can reproduce by hand, extended to the
  (4d)(4f)(5s,5p)(5d)(6s,6p) groups. Don't add Clementi–Raimondi values.
  The default electron is the last occupied Slater group: usually outer ns/np, but Pd's empty
  5s means its target is 4d (Z_eff = 6.85), not the 4s/4p core.
- **No "Slater estimate" curve.** Slater's Z_eff gives the wrong shape for ionization energy
  even after rescaling (Li→Ne would rise ×20, not ×4), so the graph overlays Z_eff itself on a
  second axis instead of a predicted property.
- **Explanations follow the selected configurations.** The same-shell explanation is used for
  increasing, constant-n s/p runs. Runs containing d/f elements describe endpoint target groups
  and n values, and qualify the orbital-specific Slater estimates rather than assuming a rise.
  In particular, Pd → Ag compares 4d (n = 4) with the 5s/5p group (n = 5).
- **Anomalies are data.** `common/model/TrendAnomalies.ts` lists every place where Z_eff and n
  predict the wrong direction (Be→B, N→O, Al→Ga, …). `tests/common/TrendAnomalies.test.ts` checks
  the main trends hold everywhere else and that each listed pair is a real reversal, so a typo in
  either file fails the tests.
- **Unbound anions are not zero.** Electron affinity of He, Be, N, Ne, Mg, Ar, Mn, Zn, Kr (and
  Cd, Xe, Yb, Hg, Rn) is `UNBOUND`: shown as "< 0 (no stable anion)", coloured and plotted at 0 with a hollow marker.
- **Energies are stored in eV** (NIST / CRC) and shown in kJ/mol unless the eV preference
  (`?electronVolts`) is on.
- **One element is shared** between screens (`SelectedElementModel`, created in `main.ts`): the
  anchor of a Trends selection is the element the Shielding screen opens on. Trends construction
  and reset synchronize the default period-2 anchor (Li); Shielding opened first starts on Cl.
  Shielding reset restores Cl within the current extent; `NumberProperty.reset()` would also
  restore the startup range, so use `setValueAndRange` with the current table instead.

## Key files

| File | Purpose |
|---|---|
| `src/PeriodicTrendsConstants.ts` | kJ/mol per eV, defaults, layout sizes, fonts |
| `src/PeriodicTrendsColors.ts` | All `ProfileColorProperty` instances, including the heat map and Slater-weight tints |
| `src/common/model/ElementData.ts` | H–Rn: period, group, grid row/column, block, configuration (NIST exceptions), radius, IE, EA, EN |
| `src/common/model/TableExtent.ts` | Enumeration of the table shown (Kr / Xe / Rn) and the lookups on it |
| `src/common/model/Slater.ts` | Slater groups, itemised shielding, Z_eff, n* |
| `src/common/model/PeriodicProperty.ts` | Enumeration of the mapped quantities (four properties + Z_eff) |
| `src/common/model/TrendSelection.ts` | Single / period / group selections; drag snapping; keyboard stepping |
| `src/common/model/TrendAnomalies.ts` | Anomaly list and matching to a selection |
| `src/common/model/SelectedElementModel.ts` | The element shared by both screens |
| `src/common/view/formatValues.ts` | Unit conversion, cell text, readouts, localised names |
| `src/common/view/heatColor.ts` | Heat-map fill and readable text colour per cell |
| `src/common/view/ControlFactory.ts` | Themed control builders (copied from LightAndAtoms; labels are RichText) |
| `src/common/PeriodicTrendsHotkeyData.ts` | Keys of the table and the element picker, for listeners and help dialogs |
| `src/trends/view/PeriodicTableNode.ts` | The table: click, drag, period/group headers, keyboard grid |
| `src/trends/view/TrendChartNode.ts` | bamboo graph, Z_eff overlay, anomaly badges |
| `src/trends/view/describeSelection.ts` | Explanation text (visible markup and spoken plain text) |
| `src/trends/view/ExplanationNode.ts` | "Why?" panel |
| `src/trends/view/ElementCardNode.ts` / `HeatLegendNode.ts` | Card and colour key in the empty d-block gap |
| `src/shielding/view/ShellAtomNode.ts` | Atom by Slater group, electrons tinted by shielding weight |
| `src/shielding/view/SlaterBreakdownNode.ts` | Slater's rules table and Z_eff = Z − S |
| `src/shielding/view/EffectiveChargeNode.ts` | Nuclear vs. felt charge bars |
| `src/shielding/view/ElementPickerNode.ts` | Compact table for choosing the element |

## Accessibility

- The Trends table is one focusable grid with a dashed cursor: arrows move (skipping empty
  slots, each move spoken), Enter/Space selects, Shift+arrows extends a period or group run from
  where the extension started, P / G select the whole period / group. Keys are documented via
  `PeriodicTrendsHotkeyData`. Period and group header numbers are pointer-only shortcuts; P and G
  are their keyboard path.
- Every committed selection is announced (`addAccessibleResponse`) with the property's first and
  last values and the Z_eff change. Both screen summaries have a **live** current-details
  paragraph; the Shielding one reads Slater's rules group by group.
- The Shielding element picker selects on each arrow key; changing element announces the outer
  electron's Z_eff. Shell rings are pointer shortcuts for the "Electron to look at" radio buttons.
  Their mouse/touch hit areas must be annular and separated at neighboring ring midpoints.
- The table preserves the moving cursor during keyboard commits; external selections, reset and
  extent changes clear old Shift+arrow anchors. The shielding legend follows the electron
  panel's changing bounds as the extent preference reveals more choices.
- Both table labels and the Trends play-area summary interpolate the localized endpoint name
  through `common/view/tableDescriptionProperty.ts`, following live extent and locale changes.
  The Slater grid has a maximum width so translated columns stay inside the middle panel.

## Compliance carve-outs

None: every colour is in `PeriodicTrendsColors.ts` (heat-map cells blend two profile colours at
runtime).

## Testing

| Path | Purpose |
|---|---|
| `tests/common/Slater.test.ts` | Textbook Slater values (N 3.90, Cl 6.10, K 2.20, Fe 3.75, Zn 4.35, Zn 3d 8.85, …) |
| `tests/common/ElementData.test.ts` | 36 contiguous elements, placement, configurations sum to Z, Cr/Cu, intentional gaps |
| `tests/common/TrendSelection.test.ts` | Drag snapping, ordering, clamping, empty slots, keyboard stepping |
| `tests/common/SelectedElementModel.test.ts` | Reset preserves the current extent's numeric range after expansion or shrinking |
| `tests/common/TrendAnomalies.test.ts` | Trends hold except listed anomalies; every listed pair is a real reversal; matching and placement |
| `tests/trends/model/TrendsModel.test.ts` | Shared selection consistency at initialization, reset and extent shrink (Vitest, happy-dom) |
| `tests/trends/view/describeSelection.test.ts` | Regular s/p explanation, V → Cr reversal, Pd → Ag target change, an interior configuration exception and qualified experimental trends |
| `tests/browser/review-regressions.spec.ts` | Keyboard extension, pointer/touch rings, Pd shielding, live Preferences layout, Explain/reset, localized extent titles |
| `tests/browser/follow-up-regressions.spec.ts` | Localized configuration-aware explanations, translated Slater-grid bounds, live accessible extent labels and summary, native Preferences, runtime locale changes, Reset All followed by extended-table keyboard selection |
| `tests/memory-leak.test.ts`, `tests/helpers/memoryLeak.ts`, `tests/fuzz/fuzz.spec.ts` | Template-owned leak harness and fuzz smoke |

- Run the functional browser regressions with `FUZZ_PORT=5182 npx playwright test tests/browser`.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
