# AGENTS.md — Periodic Trends

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Periodic trends for **introductory (General) chemistry**, hydrogen to krypton: atomic radius,
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

- **Z = 1–36 only, Slater's rules only.** Both are deliberate (the user's choice): periods 1–4
  cover Gen Chem, and Slater's rules are the method students can reproduce by hand. Don't add
  Clementi–Raimondi values or the f-block.
- **No "Slater estimate" curve.** Slater's Z_eff gives the wrong shape for ionization energy
  even after rescaling (Li→Ne would rise ×20, not ×4), so the graph overlays Z_eff itself on a
  second axis instead of a predicted property.
- **Anomalies are data.** `common/model/TrendAnomalies.ts` lists every place where Z_eff and n
  predict the wrong direction (Be→B, N→O, Al→Ga, …). `tests/common/TrendAnomalies.test.ts` checks
  the main trends hold everywhere else and that each listed pair is a real reversal, so a typo in
  either file fails the tests.
- **Unbound anions are not zero.** Electron affinity of He, Be, N, Ne, Mg, Ar, Mn, Zn, Kr is
  `UNBOUND`: shown as "< 0 (no stable anion)", coloured and plotted at 0 with a hollow marker.
- **Energies are stored in eV** (NIST / CRC) and shown in kJ/mol unless the eV preference
  (`?electronVolts`) is on.
- **One element is shared** between screens (`SelectedElementModel`, created in `main.ts`): the
  anchor of a Trends selection is the element the Shielding screen opens on.

## Key files

| File | Purpose |
|---|---|
| `src/PeriodicTrendsConstants.ts` | kJ/mol per eV, defaults, layout sizes, fonts |
| `src/PeriodicTrendsColors.ts` | All `ProfileColorProperty` instances, including the heat map and Slater-weight tints |
| `src/common/model/ElementData.ts` | H–Kr: period, group, block, configuration (Cr/Cu exceptions), radius, IE, EA, EN |
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

## Compliance carve-outs

None: every colour is in `PeriodicTrendsColors.ts` (heat-map cells blend two profile colours at
runtime).

### Template-owned files (drift-checked)

Infrastructure files are owned by this template and must stay byte-identical in every sim
(after substituting the sim's own name). `Baton/scripts/check-template-drift.sh <Sim>` compares a
sim against this repo using `Baton/config/template-manifest.json`, which lists the exact files,
the required `package.json` scripts, and the few keys a sim may extend (extra `biome.json`
ignores, extra tsconfig `types`, CSP/Permissions additions).

To diverge on purpose, add a bullet to the sim's own `## Compliance carve-outs` section naming
the file in backticks and the reason, e.g. ``- `tests/setup.ts`: adds a WebGPU mock``. The drift
checker treats a file named there as approved. Fix template-owned files **here first**, then
propagate — never hand-edit one in a single sim.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Testing

| Path | Purpose |
|---|---|
| `tests/common/Slater.test.ts` | Textbook Slater values (N 3.90, Cl 6.10, K 2.20, Fe 3.75, Zn 4.35, Zn 3d 8.85, …) |
| `tests/common/ElementData.test.ts` | 36 contiguous elements, placement, configurations sum to Z, Cr/Cu, intentional gaps |
| `tests/common/TrendSelection.test.ts` | Drag snapping, ordering, clamping, empty slots, keyboard stepping |
| `tests/common/TrendAnomalies.test.ts` | Trends hold except listed anomalies; every listed pair is a real reversal; matching and placement |
| `tests/TimeModel.test.ts`, `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned (TimeModel is unused here but kept for drift) |

- Unit tests live only under root `tests/`, mirroring `src/`.
- Optional: `npm run test:fuzz` / `test:fuzz:quick` / `test:fuzz:long` (not part of default CI).

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` on app, scripts, and tests) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke (pointer + keyboard, `?ea`, 30s each; `npm run test:fuzz -- 90` to change) |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run test:fuzz:long` | 300s fuzz |
| `npm run icons` | Regenerate PWA icons; seed missing screenshots, preserve existing ones |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |

`src/init.ts` reads `version` from `package.json`, so the patch bump shows up in the About dialog
without a second edit.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
