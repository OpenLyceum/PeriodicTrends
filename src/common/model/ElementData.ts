/**
 * ElementData.ts
 *
 * Periodic-table data for hydrogen through radon (Z = 1–86). Which of them the table shows (to Kr,
 * Xe or Rn) is chosen by TableExtent. Pure data and lookups, no Scenery imports, so tests can use
 * it directly.
 *
 * Sources (see doc/model.md):
 *   - Atomic radius: single-bond covalent radii, B. Cordero et al., Dalton Trans. 2832 (2008), pm.
 *     The same table MolScope uses. Mn, Fe and Co take the low-spin values. Noble-gas radii are
 *     estimated from very few compounds.
 *   - First ionization energy: NIST Atomic Spectra Database, eV.
 *   - Electron affinity: H–Kr from the CRC Handbook of Chemistry and Physics, "Electron
 *     Affinities" (after Andersen, Haugen & Hotop, J. Phys. Chem. Ref. Data 28, 1511 (1999)); Rb–Rn
 *     from the same compilation updated with later photodetachment measurements (Wikipedia
 *     "Electron affinity (data page)", 2026), eV. Pm, Sm, Ho and Er are calculated, not measured.
 *     Atoms whose anion is not stable are marked UNBOUND rather than given a number.
 *   - Electronegativity: Pauling scale (CRC Handbook). Undefined for He, Ne, Ar, Rn and for Pm,
 *     Eu, Tb and Yb.
 */

/** One subshell in a ground-state configuration: n, l (0 = s, 1 = p, 2 = d, 3 = f) and the electron count. */
export type Subshell = {
  readonly n: number;
  readonly l: number;
  readonly count: number;
};

export type Block = "s" | "p" | "d" | "f";

/** Electron affinity of an atom whose anion is not stable (energy is absorbed, not released). */
export const UNBOUND = "unbound";
export type ElectronAffinity = number | typeof UNBOUND;

export type ElementData = {
  readonly z: number;
  readonly symbol: string;
  readonly period: number;
  /** IUPAC group, 1–18, or null for the lanthanides (drawn in their own row). */
  readonly group: number | null;
  /** Grid row on the table: the period, or LANTHANIDE_ROW for La–Lu. */
  readonly row: number;
  /** Grid column on the table, 1–18: the group, or 3–17 across the lanthanide row. */
  readonly column: number;
  readonly block: Block;
  /** Ground-state configuration, in filling order (1s 2s 2p 3s 3p 4s 3d 4p …). */
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
/** Last element with data. Which elements are shown is chosen by TableExtent. */
export const MAX_Z = 86;
export const GROUP_COUNT = 18;

/** La–Lu are drawn in a detached row under period 6, starting under group 3. */
export const FIRST_LANTHANIDE = 57;
export const LAST_LANTHANIDE = 71;
export const LANTHANIDE_ROW = 7;
export const LANTHANIDE_FIRST_COLUMN = 3;

/** Subshells in aufbau filling order, as far as radon needs. */
const FILLING_ORDER: readonly [number, number][] = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 0],
  [3, 1],
  [4, 0],
  [3, 2],
  [4, 1],
  [5, 0],
  [4, 2],
  [5, 1],
  [6, 0],
  [4, 3],
  [5, 2],
  [6, 1],
];

/** Capacity of a subshell with angular momentum l. */
function capacity(l: number): number {
  return 2 * (2 * l + 1);
}

/** Configuration by the aufbau order alone. */
function aufbau(z: number): Subshell[] {
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

/**
 * Ground-state configurations that break the aufbau order (NIST), as a noble-gas core plus the
 * outer subshells in filling order. Cr, Cu, Mo, Ag, Au and Pt move an s electron into d to reach
 * a half-filled or filled d subshell (Pt and Pd go further); in Nb, Ru and Rh the 4d and 5s are
 * close enough in energy that a 5s¹ configuration wins; La, Ce and Gd put an electron in 5d
 * instead of 4f (Gd keeps a half-filled 4f⁷).
 */
const CONFIGURATION_EXCEPTIONS: Readonly<Record<number, string>> = {
  24: "[Ar] 4s1 3d5",
  29: "[Ar] 4s1 3d10",
  41: "[Kr] 5s1 4d4",
  42: "[Kr] 5s1 4d5",
  44: "[Kr] 5s1 4d7",
  45: "[Kr] 5s1 4d8",
  46: "[Kr] 4d10",
  47: "[Kr] 5s1 4d10",
  57: "[Xe] 6s2 5d1",
  58: "[Xe] 6s2 4f1 5d1",
  64: "[Xe] 6s2 4f7 5d1",
  78: "[Xe] 6s1 4f14 5d9",
  79: "[Xe] 6s1 4f14 5d10",
};

const NOBLE_GAS_CORES: Readonly<Record<string, number>> = { He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54 };

/** Parses "[Kr] 5s1 4d4" into subshells. */
function parseConfiguration(text: string): Subshell[] {
  const [core = "", ...outer] = text.split(" ");
  const coreZ = NOBLE_GAS_CORES[core.slice(1, -1)] ?? 0;
  return [
    ...aufbau(coreZ),
    ...outer.map((term) => ({
      n: Number(term[0]),
      l: "spdf".indexOf(term[1] ?? "s"),
      count: Number(term.slice(2)),
    })),
  ];
}

/** Ground-state configuration of element z, by aufbau with the listed exceptions. */
export function groundStateConfiguration(z: number): readonly Subshell[] {
  const exception = CONFIGURATION_EXCEPTIONS[z];
  return exception ? parseConfiguration(exception) : aufbau(z);
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
  "Rb,220,4.177,0.486,0.82",
  "Sr,195,5.695,0.052,0.95",
  "Y,190,6.217,0.311,1.22",
  "Zr,175,6.634,0.433,1.33",
  "Nb,164,6.759,0.917,1.60",
  "Mo,154,7.092,0.747,2.16",
  "Tc,147,7.119,0.550,1.90",
  "Ru,146,7.361,1.046,2.20",
  "Rh,142,7.459,1.143,2.28",
  "Pd,139,8.337,0.562,2.20",
  "Ag,145,7.576,1.304,1.93",
  "Cd,144,8.994,u,1.69",
  "In,142,5.786,0.384,1.78",
  "Sn,139,7.344,1.112,1.96",
  "Sb,139,8.608,1.047,2.05",
  "Te,138,9.010,1.971,2.10",
  "I,139,10.451,3.059,2.66",
  "Xe,140,12.130,u,2.60",
  "Cs,244,3.894,0.472,0.79",
  "Ba,215,5.212,0.145,0.89",
  "La,207,5.577,0.558,1.10",
  "Ce,204,5.539,0.600,1.12",
  "Pr,203,5.470,0.109,1.13",
  "Nd,201,5.525,0.097,1.14",
  "Pm,199,5.582,0.129,-",
  "Sm,198,5.644,0.162,1.17",
  "Eu,198,5.670,0.116,-",
  "Gd,196,6.150,0.212,1.20",
  "Tb,194,5.864,0.131,-",
  "Dy,192,5.939,0.015,1.22",
  "Ho,192,6.021,0.338,1.23",
  "Er,189,6.108,0.312,1.24",
  "Tm,190,6.184,1.029,1.25",
  "Yb,187,6.254,u,-",
  "Lu,187,5.426,0.239,1.27",
  "Hf,175,6.825,0.178,1.30",
  "Ta,170,7.550,0.329,1.50",
  "W,162,7.864,0.816,2.36",
  "Re,151,7.834,0.060,1.90",
  "Os,144,8.438,1.078,2.20",
  "Ir,141,8.967,1.564,2.20",
  "Pt,136,8.959,2.125,2.28",
  "Au,136,9.226,2.309,2.54",
  "Hg,132,10.438,u,2.00",
  "Tl,145,6.108,0.320,1.62",
  "Pb,146,7.417,0.357,2.33",
  "Bi,148,7.286,0.942,2.02",
  "Po,140,8.418,1.400,2.00",
  "At,150,9.318,2.416,2.20",
  "Rn,150,10.748,u,-",
];

/** Last Z of each period. */
const PERIOD_ENDS = [2, 10, 18, 36, 54, 86];

/** Period of element z. */
function periodOf(z: number): number {
  return PERIOD_ENDS.findIndex((end) => z <= end) + 1;
}

export function isLanthanide(z: number): boolean {
  return z >= FIRST_LANTHANIDE && z <= LAST_LANTHANIDE;
}

/** IUPAC group of element z, or null for a lanthanide. */
function groupOf(z: number): number | null {
  if (z === 1) {
    return 1;
  }
  if (z === 2) {
    return 18;
  }
  if (isLanthanide(z)) {
    return null;
  }
  const period = periodOf(z);
  const column = z - (PERIOD_ENDS[period - 2] ?? 0);
  if (period <= 3) {
    // Periods 2 and 3 skip the ten d-block columns after group 2.
    return column <= 2 ? column : column + 10;
  }
  // Period 6 skips the fourteen elements after La that sit in the lanthanide row.
  return period === 6 && z > LAST_LANTHANIDE ? column - 14 : column;
}

function blockOf(group: number | null, z: number): Block {
  if (group === null) {
    return "f";
  }
  if (z === 2 || group <= 2) {
    return "s";
  }
  return group <= 12 ? "d" : "p";
}

export const ELEMENTS: readonly ElementData[] = TABLE.map((row, index) => {
  const [symbol = "", radius = "", ie = "", ea = "", en = ""] = row.split(",");
  const z = index + 1;
  const group = groupOf(z);
  const period = periodOf(z);
  return {
    z,
    symbol,
    period,
    group,
    row: group === null ? LANTHANIDE_ROW : period,
    column: group ?? LANTHANIDE_FIRST_COLUMN + z - FIRST_LANTHANIDE,
    block: blockOf(group, z),
    configuration: groundStateConfiguration(z),
    radius: Number(radius),
    ionizationEnergy: Number(ie),
    electronAffinity: ea === "u" ? UNBOUND : Number(ea),
    electronegativity: en === "-" ? null : Number(en),
  };
});

/** The element with atomic number z (1–86). */
export function getElement(z: number): ElementData {
  const element = ELEMENTS[z - 1];
  if (!element) {
    throw new Error(`No element data for Z = ${z}`);
  }
  return element;
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

/** Elements up to this Z have short enough configurations to write out in full. */
const FULL_CONFIGURATION_MAX_Z = 36;

/**
 * Configuration as display text: in full up to krypton, and from Rb on as the preceding noble-gas
 * core plus the outer subshells, e.g. "[Xe] 6s² 4f¹⁴ 5d¹⁰ 6p²".
 */
export function shortConfigurationText(element: ElementData): string {
  if (element.z <= FULL_CONFIGURATION_MAX_Z) {
    return configurationText(element.configuration);
  }
  const [core, coreZ] = Object.entries(NOBLE_GAS_CORES)
    .filter(([, z]) => z < element.z)
    .reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  const coreSubshells = aufbau(coreZ);
  const outer = element.configuration.filter(
    (subshell) => !coreSubshells.some((c) => c.n === subshell.n && c.l === subshell.l && c.count === subshell.count),
  );
  return `[${core}] ${configurationText(outer)}`;
}
