# Model

Periodic Trends holds data for hydrogen to radon (Z = 1–86) and shows hydrogen to krypton by
default (Z = 1–36, periods 1–4). A preference extends the table through xenon (Z = 1–54) or
through radon (Z = 1–86, with La–Lu in a detached row). Everything in the model is static data
plus Slater's rules; nothing evolves in time.

## Data

All values are in `src/common/model/ElementData.ts`.

| Quantity | Unit stored | Source | Notes |
|---|---|---|---|
| Atomic radius | pm | Single-bond covalent radii, B. Cordero et al., *Dalton Trans.* 2832 (2008) | Same table as MolScope. Mn, Fe, Co use the low-spin values. Noble-gas radii are estimated from very few compounds. |
| First ionization energy | eV | NIST Atomic Spectra Database (all 86, retrieved 2026-10-29) | Shown in kJ/mol (× 96.485 kJ mol⁻¹ eV⁻¹) unless the eV preference is on. |
| Electron affinity | eV | H–Kr: CRC Handbook, "Electron Affinities" (after Andersen, Haugen & Hotop, *J. Phys. Chem. Ref. Data* 28, 1511 (1999)). Rb–Rn: the same compilation updated with later photodetachment measurements (e.g. Hf, Lu, Ce, Pr, Nd, Tb, Ir, Os; Wikipedia "Electron affinity (data page)", 2026) | Pm, Sm, Ho and Er are calculated, not measured. Positive = energy released. He, Be, N, Ne, Mg, Ar, Mn, Zn, Kr, Cd, Xe, Yb, Hg and Rn have no stable anion and are stored as `UNBOUND`, displayed "< 0 (no stable anion)", coloured and plotted at 0 with a hollow marker. |
| Electronegativity | — | Pauling scale (CRC Handbook, via PubChem) | Undefined for He, Ne, Ar, Rn and Pm, Eu, Tb, Yb (grey cells, gaps in the graph). Kr = 3.00, Xe = 2.60. |

Ground-state configurations follow the aufbau order 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d
6p, except (NIST) Cr `[Ar] 4s¹ 3d⁵`, Cu `[Ar] 4s¹ 3d¹⁰`, Nb `[Kr] 5s¹ 4d⁴`, Mo `[Kr] 5s¹ 4d⁵`,
Ru `[Kr] 5s¹ 4d⁷`, Rh `[Kr] 5s¹ 4d⁸`, Pd `[Kr] 4d¹⁰`, Ag `[Kr] 5s¹ 4d¹⁰`, La `[Xe] 6s² 5d¹`,
Ce `[Xe] 6s² 4f¹ 5d¹`, Gd `[Xe] 6s² 4f⁷ 5d¹`, Pt `[Xe] 6s¹ 4f¹⁴ 5d⁹` and Au
`[Xe] 6s¹ 4f¹⁴ 5d¹⁰`. Beyond krypton, configurations are displayed with a noble-gas core.

## Table layout beyond krypton

Through radon the table follows the OpenStax layout: the period-6 slot of group 3 is a "57–71"
placeholder, and La–Lu (15 elements) sit in a detached row starting under group 3. The
lanthanides belong to period 6 but to no group, so a whole-period selection of period 6 includes
them in Z order (32 elements), a drag across period 6 that spans the placeholder takes them in,
group 3 is Sc and Y only, and a drag that starts in the lanthanide row stays in it.

## Slater's rules

`src/common/model/Slater.ts`, after J. C. Slater, *Phys. Rev.* 36, 57 (1930).

Electrons are grouped (1s)(2s, 2p)(3s, 3p)(3d)(4s, 4p)(4d)(4f)(5s, 5p)(5d)(6s, 6p). For an
electron in an (ns, np) group:

- each other electron in the same group shields 0.35 (0.30 in 1s);
- each electron with principal quantum number n − 1 shields 0.85 (this includes 3d for 4s/4p,
  4d for 5s/5p and 5d for 6s/6p; 4f counts as n − 2 for 6s/6p and shields 1.00);
- each electron with n − 2 or lower shields 1.00.

For a d or f electron, each other electron in its group shields 0.35 and every electron in a
group to its left shields 1.00. Electrons in groups to the right of the target never shield.

Z<sub>eff</sub> = Z − S. The "outer electron" is in the last occupied Slater group, normally
(ns, np); for the d- and f-blocks that is usually the ns electron, removed first on ionisation.
Pd is the exception: [Kr] 4d¹⁰ has no 5s electron, so its target is 4d. The 36 core electrons
shield 1.00 each and its nine other 4d electrons shield 0.35 each: S = 39.15, Z<sub>eff</sub> = 6.85.

Worked examples (tested): N 2p 3.90, O 4.55, Cl 3p 6.10, K 4s 2.20, Fe 4s 3.75, Cu 4s 3.70,
Zn 4s 4.35, Zn 3d 8.85, Rb 5s 2.20, Pd 4d 6.85, Ag 5s 3.70, Ag 4d 7.85, I 5p 7.60,
Gd 4f 15.90, Au 6s 3.70.

The effective principal quantum number n* (1, 2, 3, 3.7, 4.0, 4.2) is available but not
displayed.

## How the trends are explained

- **Across a period** n is constant and Z<sub>eff</sub> rises: each added proton is only partly
  cancelled by the added same-shell electron (+1 − 0.35 = +0.65 per element in the s and p
  blocks; +1 − 0.85 = +0.15 across the 3d series, where the electrons go into an inner shell).
  Outer electrons are pulled harder at about the same distance: radius falls, ionization
  energy, electron affinity and electronegativity rise.
- **Down a group** n grows by one shell each period while Z<sub>eff</sub> changes much less;
  the outer electron is farther out and screened by every inner shell, so radius grows and the
  other three properties fall.

The sim deliberately does **not** plot a property predicted from Slater's Z<sub>eff</sub>
(r ∝ n*²/Z<sub>eff</sub>, IE ∝ (Z<sub>eff</sub>/n*)²): even scaled to fit, the IE estimate
rises about ×20 from Li to Ne where the data rise ×4. The graph overlays Z<sub>eff</sub> itself.

## Anomalies

`src/common/model/TrendAnomalies.ts`. A *pair* anomaly is a reversal between two elements; a
*range* covers a d series or the lanthanides, where properties change little and irregularly.
Anomalies beyond krypton appear only when the table extends that far.

| Property | Where | Key | Reason |
|---|---|---|---|
| IE | Be→B, Mg→Al, Zn→Ga | `pBelowS` | New electron enters a higher p orbital, partly shielded by the filled s pair |
| IE | N→O, P→S, As→Se | `pairing` | First paired p electron; repulsion in the shared orbital |
| IE | Al→Ga (down group 13) | `dContraction` | Ten poorly shielding 3d electrons raise Ga's Z<sub>eff</sub> |
| IE, radius, EA, EN | Sc–Zn | `dBlockFlat` | Electrons go into the inner 3d and shield 4s well (0.85) |
| Radius | F→Ne, Cl→Ar | `nobleGasRadius` | Noble-gas covalent radii are estimates |
| Radius | Al→Ga | `dContraction` | Ga no larger than Al |
| EA | Li→Be, Na→Mg | `unboundAnion` | Full s subshell; added electron would enter p |
| EA | C→N, Si→P, Ge→As | `halfFilledP` | Half-filled p; added electron must pair |
| EA | F→Ne, Cl→Ar, Br→Kr | `newShell` | Full shell; added electron would start a new shell |
| EA | F→Cl, O→S (down a group) | `fluorineCrowded` | The small n = 2 shell crowds an added electron |
| EN | Al→Ga, Si→Ge | `dContraction` | As for IE |
| IE | Cd→In, Hg→Tl | `pBelowS` | As for Zn→Ga |
| IE, radius, EA, EN | Y–Cd, Hf–Hg | `dBlockFlat` | Electrons go into the inner d and shield the outer s well |
| IE, radius, EA, EN | La–Lu | `lanthanideSeries` | Electrons go into the deep 4f; properties barely change, radius shrinks slowly |
| IE, EN | In→Tl, Sn→Pb (down groups 13, 14) | `lanthanideContraction` | Fourteen poorly shielding 4f electrons raise Z<sub>eff</sub> |
| Radius | Zr→Hf, Ru→Os, Rh→Ir, Pd→Pt, Ag→Au, Cd→Hg | `lanthanideContraction` | Period-6 d-block atoms no larger than period 5 |
| IE | Pb→Bi | `relativistic` | Relativistic 6p½ pair filled at Pb; Bi's third 6p electron is higher |
| Radius | Po→At | `estimatedRadius` | At's radius is an estimate |
| EA | K→Ca, Rb→Sr, Cs→Ba | `filledS` | Full s subshell; added electron must enter a higher subshell |
| EA | Sn→Sb | `halfFilledP` | As for Ge→As |
| EA | I→Xe, At→Rn | `newShell` | As for Br→Kr |
| EN | Pb→Bi, Bi→Po | `irregularEN` | Heavy p-block Pauling values are uncertain (Pb's 2.33 is for Pb(IV)) |

Radii within ±2 pm (e.g. As 119, Se 120, Br 120 pm) are treated as equal: that is within the
Cordero uncertainty.
