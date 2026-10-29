/**
 * ElementData.ts
 *
 * Periodic-table data for hydrogen through krypton (Z = 1–36), the range the sim covers.
 * Pure data and lookups, no Scenery imports, so tests can use it directly.
 *
 * Sources (see doc/model.md):
 *   - Atomic radius: single-bond covalent radii, B. Cordero et al., Dalton Trans. 2832 (2008), pm.
 *     The same table MolScope uses. Mn, Fe and Co take the low-spin values. Noble-gas radii are
 *     estimated from very few compounds.
 *   - First ionization energy: NIST Atomic Spectra Database, eV.
 *   - Electron affinity: CRC Handbook of Chemistry and Physics, "Electron Affinities" (after
 *     Andersen, Haugen & Hotop, J. Phys. Chem. Ref. Data 28, 1511 (1999)), eV. Atoms whose anion is
 *     not stable are marked UNBOUND rather than given a number.
 *   - Electronegativity: Pauling scale (CRC Handbook). Undefined for He, Ne and Ar.
 */

/** One subshell in a ground-state configuration: n, l (0 = s, 1 = p, 2 = d) and the electron count. */
export type Subshell = {
  readonly n: number;
  readonly l: number;
  readonly count: number;
};

export type Block = "s" | "p" | "d";

/** Electron affinity of an atom whose anion is not stable (energy is absorbed, not released). */
export const UNBOUND = "unbound";
export type ElectronAffinity = number | typeof UNBOUND;

export type ElementData = {
  readonly z: number;
  readonly symbol: string;
  readonly period: number;
  /** IUPAC group, 1–18. */
  readonly group: number;
  readonly block: Block;
  /** Ground-state configuration, in filling order (1s 2s 2p 3s 3p 4s 3d 4p). */
  readonly configuration: readonly Subshell[];
  /** Covalent radius, pm. */
  readonly radius: number;
  /** First ionization energy, eV. */
  readonly ionizationEnergy: number;
  /** Electron affinity, eV (positive = energy released), or UNBOUND. */
  readonly electronAffinity: ElectronAffinity;
  /** Pauling electronegativity, or null where it is not defined. */
  readonly electronegativity: number | null;
};

export const MIN_Z = 1;
export const MAX_Z = 36;
export const PERIOD_COUNT = 4;
export const GROUP_COUNT = 18;

/** Subshells in aufbau filling order, as far as krypton needs. */
const FILLING_ORDER: readonly [number, number][] = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 0],
  [3, 1],
  [4, 0],
  [3, 2],
  [4, 1],
];

/** Capacity of a subshell with angular momentum l. */
function capacity(l: number): number {
  return 2 * (2 * l + 1);
}

/**
 * Ground-state configurations that break the aufbau order: chromium and copper move one 4s
 * electron into 3d to reach a half-filled or filled 3d subshell.
 */
const CONFIGURATION_EXCEPTIONS: Readonly<Record<number, readonly Subshell[]>> = {
  24: [
    { n: 1, l: 0, count: 2 },
    { n: 2, l: 0, count: 2 },
    { n: 2, l: 1, count: 6 },
    { n: 3, l: 0, count: 2 },
    { n: 3, l: 1, count: 6 },
    { n: 4, l: 0, count: 1 },
    { n: 3, l: 2, count: 5 },
  ],
  29: [
    { n: 1, l: 0, count: 2 },
    { n: 2, l: 0, count: 2 },
    { n: 2, l: 1, count: 6 },
    { n: 3, l: 0, count: 2 },
    { n: 3, l: 1, count: 6 },
    { n: 4, l: 0, count: 1 },
    { n: 3, l: 2, count: 10 },
  ],
};

/** Ground-state configuration of element z, by aufbau with the Cr and Cu exceptions. */
export function groundStateConfiguration(z: number): readonly Subshell[] {
  const exception = CONFIGURATION_EXCEPTIONS[z];
  if (exception) {
    return exception;
  }
  const subshells: Subshell[] = [];
  let remaining = z;
  for (const [n, l] of FILLING_ORDER) {
    if (remaining <= 0) {
      break;
    }
    const count = Math.min(remaining, capacity(l));
    subshells.push({ n, l, count });
    remaining -= count;
  }
  return subshells;
}

// symbol, radius (pm), first IE (eV), EA (eV, "u" = unbound), Pauling EN ("-" = undefined)
const TABLE = [
  "H,31,13.598,0.754,2.20",
  "He,28,24.587,u,-",
  "Li,128,5.392,0.618,0.98",
  "Be,96,9.323,u,1.57",
  "B,84,8.298,0.280,2.04",
  "C,76,11.260,1.262,2.55",
  "N,71,14.534,u,3.04",
  "O,66,13.618,1.461,3.44",
  "F,57,17.423,3.401,3.98",
  "Ne,58,21.565,u,-",
  "Na,166,5.139,0.548,0.93",
  "Mg,141,7.646,u,1.31",
  "Al,121,5.986,0.433,1.61",
  "Si,111,8.152,1.390,1.90",
  "P,107,10.487,0.747,2.19",
  "S,105,10.360,2.077,2.58",
  "Cl,102,12.968,3.613,3.16",
  "Ar,106,15.760,u,-",
  "K,203,4.341,0.501,0.82",
  "Ca,176,6.113,0.025,1.00",
  "Sc,170,6.561,0.188,1.36",
  "Ti,160,6.828,0.079,1.54",
  "V,153,6.746,0.525,1.63",
  "Cr,139,6.767,0.666,1.66",
  "Mn,139,7.434,u,1.55",
  "Fe,132,7.902,0.151,1.83",
  "Co,126,7.881,0.662,1.88",
  "Ni,124,7.640,1.156,1.91",
  "Cu,132,7.726,1.235,1.90",
  "Zn,122,9.394,u,1.65",
  "Ga,122,5.999,0.430,1.81",
  "Ge,120,7.900,1.233,2.01",
  "As,119,9.789,0.804,2.18",
  "Se,120,9.752,2.021,2.55",
  "Br,120,11.814,3.364,2.96",
  "Kr,116,14.000,u,3.00",
];

/** Period of element z (1–36). */
function periodOf(z: number): number {
  return z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : 4;
}

/** IUPAC group of element z (1–36). */
function groupOf(z: number): number {
  if (z === 1) {
    return 1;
  }
  if (z === 2) {
    return 18;
  }
  const periodStart = [0, 1, 3, 11, 19][periodOf(z)] ?? 0;
  const column = z - periodStart + 1;
  if (z >= 19) {
    return column;
  }
  // Periods 2 and 3 skip the ten d-block columns after group 2.
  return column <= 2 ? column : column + 10;
}

function blockOf(group: number, z: number): Block {
  if (z === 2 || group <= 2) {
    return "s";
  }
  return group <= 12 ? "d" : "p";
}

export const ELEMENTS: readonly ElementData[] = TABLE.map((row, index) => {
  const [symbol = "", radius = "", ie = "", ea = "", en = ""] = row.split(",");
  const z = index + 1;
  const group = groupOf(z);
  return {
    z,
    symbol,
    period: periodOf(z),
    group,
    block: blockOf(group, z),
    configuration: groundStateConfiguration(z),
    radius: Number(radius),
    ionizationEnergy: Number(ie),
    electronAffinity: ea === "u" ? UNBOUND : Number(ea),
    electronegativity: en === "-" ? null : Number(en),
  };
});

/** The element with atomic number z (1–36). */
export function getElement(z: number): ElementData {
  const element = ELEMENTS[z - 1];
  if (!element) {
    throw new Error(`No element data for Z = ${z}`);
  }
  return element;
}

/** The element at (period, group), or null for an empty slot in the table. */
export function elementAt(period: number, group: number): ElementData | null {
  return ELEMENTS.find((element) => element.period === period && element.group === group) ?? null;
}

/** Elements of one period, left to right. */
export function elementsInPeriod(period: number): ElementData[] {
  return ELEMENTS.filter((element) => element.period === period);
}

/** Elements of one group, top to bottom. */
export function elementsInGroup(group: number): ElementData[] {
  return ELEMENTS.filter((element) => element.group === group);
}

/** Orbital letter for angular momentum l. */
export function orbitalLetter(l: number): string {
  return ["s", "p", "d", "f"][l] ?? "?";
}

/** Configuration as plain text with superscript digits, e.g. "1s² 2s² 2p⁶ 3s¹". */
export function configurationText(configuration: readonly Subshell[]): string {
  const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (count: number) =>
    String(count)
      .split("")
      .map((digit) => superscripts[Number(digit)])
      .join("");
  return configuration.map((s) => `${s.n}${orbitalLetter(s.l)}${sup(s.count)}`).join(" ");
}
