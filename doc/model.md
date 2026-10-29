# Model

Periodic Trends covers hydrogen to krypton (Z = 1–36, periods 1–4). Everything in the model is
static data plus Slater's rules; nothing evolves in time.

## Data

All values are in `src/common/model/ElementData.ts`.

| Quantity | Unit stored | Source | Notes |
|---|---|---|---|
| Atomic radius | pm | Single-bond covalent radii, B. Cordero et al., *Dalton Trans.* 2832 (2008) | Same table as MolScope. Mn, Fe, Co use the low-spin values. Noble-gas radii are estimated from very few compounds. |
| First ionization energy | eV | NIST Atomic Spectra Database | Shown in kJ/mol (× 96.485 kJ mol⁻¹ eV⁻¹) unless the eV preference is on. |
| Electron affinity | eV | CRC Handbook, "Electron Affinities" (after Andersen, Haugen & Hotop, *J. Phys. Chem. Ref. Data* 28, 1511 (1999)) | Positive = energy released. He, Be, N, Ne, Mg, Ar, Mn, Zn and Kr have no stable anion and are stored as `UNBOUND`, displayed "< 0 (no stable anion)", coloured and plotted at 0 with a hollow marker. |
| Electronegativity | — | Pauling scale (CRC Handbook) | Undefined for He, Ne, Ar (grey cells, gaps in the graph). Kr = 3.00. |

Ground-state configurations follow the aufbau order 1s 2s 2p 3s 3p 4s 3d 4p, except
Cr `[Ar] 3d⁵ 4s¹` and Cu `[Ar] 3d¹⁰ 4s¹`.

## Slater's rules

`src/common/model/Slater.ts`, after J. C. Slater, *Phys. Rev.* 36, 57 (1930).

Electrons are grouped (1s)(2s, 2p)(3s, 3p)(3d)(4s, 4p). For an electron in an (ns, np) group:

- each other electron in the same group shields 0.35 (0.30 in 1s);
- each electron with principal quantum number n − 1 shields 0.85 (this includes 3d for 4s/4p);
- each electron with n − 2 or lower shields 1.00.

For a 3d electron, each other 3d electron shields 0.35 and every electron in a group to its left
shields 1.00. Electrons in groups to the right of the target never shield.

Z<sub>eff</sub> = Z − S. The "outer electron" of an element is its outermost (ns, np) electron;
for the d-block that is 4s, the electron removed first on ionisation.

Worked examples (tested): N 2p 3.90, O 4.55, Cl 3p 6.10, K 4s 2.20, Fe 4s 3.75, Cu 4s 3.70,
Zn 4s 4.35, Zn 3d 8.85.

The effective principal quantum number n* (1, 2, 3, 3.7) is available but not displayed.

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
*range* covers the 3d series, where properties change little and irregularly.

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

Radii within ±2 pm (e.g. As 119, Se 120, Br 120 pm) are treated as equal: that is within the
Cordero uncertainty.
