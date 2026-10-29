# Periodic Trends

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Periodic trends for introductory (General) chemistry, hydrogen to krypton (or, by preference,
through xenon or radon). Click an element, or
drag across a period or down a group, and watch atomic radius, ionization energy, electron
affinity and electronegativity change. The trend is explained through effective nuclear charge
(Z<sub>eff</sub>, Slater's rules) and shielding, not just shown. Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Trends.** A periodic table (Z = 1–36) coloured as a heat map of the chosen property. Click
  an element to see it against every element on the table, or drag across a period or down a group (or click
  a period or group number) to plot the property along that run, with the outer electron's
  Z<sub>eff</sub> overlaid on a second axis. A "Why?" panel explains the trend: across a period n
  stays the same while Z<sub>eff</sub> rises; down a group Z<sub>eff</sub> barely changes while
  n grows. Numbered notes explain the exceptions (Be→B, N→O, the d-block contraction at Ga, the
  half-filled p subshells, F vs Cl…).
- **Shielding.** One atom drawn by Slater group, every electron tinted by how much it shields the
  chosen one (0.35, 0.85 or 1.00). Slater's rules are worked out line by line, ending in
  Z<sub>eff</sub> = Z − S, and two bars compare the nuclear charge with what the electron
  actually feels. Pick any element, or any occupied group's electron, including 3d.
- Real data: Cordero covalent radii, NIST ionization energies, CRC electron affinities (with
  "no stable anion" where it applies) and Pauling electronegativities.
- **Accessible:** the table is a keyboard grid (arrows, Enter, Shift+arrows to extend, P / G for
  a whole period or group), every selection is announced, live screen summaries, keyboard-help
  dialogs.
- **Larger table on request.** A preference (or `?maxZ=54` / `?maxZ=86`) extends the table
  through xenon (the second transition series) or through radon (the third transition series and
  the lanthanides, in their own row), with notes on the lanthanide contraction and the other
  irregularities of periods 5 and 6.
- English, French and Spanish; default and projector colour profiles; installable PWA. A
  preference (or `?electronVolts`) shows energies in eV instead of kJ/mol.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
