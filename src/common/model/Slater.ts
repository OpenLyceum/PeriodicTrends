/**
 * Slater.ts
 *
 * Slater's rules (J. C. Slater, Phys. Rev. 36, 57 (1930)) for the shielding constant S and the
 * effective nuclear charge Z_eff = Z − S felt by one electron.
 *
 * Electrons are sorted into the groups (1s)(2s,2p)(3s,3p)(3d)(4s,4p). For an electron in an
 * (ns,np) group:
 *   - each other electron in the same group shields 0.35 (0.30 in 1s);
 *   - each electron with principal quantum number n − 1 shields 0.85;
 *   - each electron with n − 2 or lower shields 1.00.
 * For an electron in an (nd) group, each other electron in the group shields 0.35 and every
 * electron in a group to its left shields 1.00. Electrons in groups to the right never shield.
 *
 * Pure functions, no Scenery imports.
 */

import type { Subshell } from "./ElementData.js";

/** Slater groups, in Slater's order (inner to outer). */
export const SLATER_GROUPS = ["1s", "2sp", "3sp", "3d", "4sp"] as const;
export type SlaterGroupId = (typeof SLATER_GROUPS)[number];

/** Shielding by one electron of each kind. */
export const SLATER_WEIGHTS = {
  sameGroup: 0.35,
  sameGroup1s: 0.3,
  nMinusOne: 0.85,
  inner: 1,
} as const;

/** Effective principal quantum number n* (Slater): 1, 2, 3, 3.7 for n = 1–4. */
export function nStar(n: number): number {
  return [0, 1, 2, 3, 3.7][n] ?? n;
}

/** Principal quantum number of a Slater group. */
export function groupN(group: SlaterGroupId): number {
  return Number(group[0]);
}

/** Display label of a Slater group, e.g. "(3s, 3p)". */
export function groupLabel(group: SlaterGroupId): string {
  switch (group) {
    case "1s":
      return "(1s)";
    case "3d":
      return "(3d)";
    default:
      return `(${group[0]}s, ${group[0]}p)`;
  }
}

/** The Slater group a subshell belongs to. */
export function groupOfSubshell(subshell: Subshell): SlaterGroupId {
  if (subshell.l === 2) {
    return "3d";
  }
  return subshell.n === 1 ? "1s" : (`${subshell.n}sp` as SlaterGroupId);
}

/** Electron count in each Slater group of a configuration (0 for unoccupied groups). */
export function groupCounts(configuration: readonly Subshell[]): Record<SlaterGroupId, number> {
  const counts: Record<SlaterGroupId, number> = { "1s": 0, "2sp": 0, "3sp": 0, "3d": 0, "4sp": 0 };
  for (const subshell of configuration) {
    counts[groupOfSubshell(subshell)] += subshell.count;
  }
  return counts;
}

/** Occupied Slater groups, inner to outer. */
export function occupiedGroups(configuration: readonly Subshell[]): SlaterGroupId[] {
  const counts = groupCounts(configuration);
  return SLATER_GROUPS.filter((group) => counts[group] > 0);
}

/**
 * The group of the valence electron: the outermost occupied (ns,np) group. For the d-block this
 * is 4s, the electron removed first on ionisation, which is the textbook convention.
 */
export function outermostGroup(configuration: readonly Subshell[]): SlaterGroupId {
  const occupied = occupiedGroups(configuration).filter((group) => group !== "3d");
  return occupied[occupied.length - 1] ?? "1s";
}

/** Where a shielding electron sits relative to the target, which fixes its Slater weight. */
export type ShieldingKind = "sameGroup" | "nMinusOne" | "inner" | "outer";

export type ShieldingContribution = {
  readonly group: SlaterGroupId;
  /** Electrons in the group that shield the target (the target itself excluded). */
  readonly count: number;
  readonly kind: ShieldingKind;
  /** Shielding per electron. */
  readonly perElectron: number;
  /** count × perElectron. */
  readonly total: number;
};

export type ShieldingResult = {
  readonly z: number;
  readonly target: SlaterGroupId;
  /** One entry per occupied group, inner to outer, including groups that do not shield. */
  readonly contributions: readonly ShieldingContribution[];
  /** Shielding constant S. */
  readonly s: number;
  /** Effective nuclear charge Z − S. */
  readonly zEff: number;
};

/** How electrons in `group` shield an electron in `target`. */
function shieldingKind(group: SlaterGroupId, target: SlaterGroupId): ShieldingKind {
  const groupIndex = SLATER_GROUPS.indexOf(group);
  const targetIndex = SLATER_GROUPS.indexOf(target);
  if (group === target) {
    return "sameGroup";
  }
  if (groupIndex > targetIndex) {
    return "outer";
  }
  if (target === "3d") {
    return "inner";
  }
  return groupN(group) === groupN(target) - 1 ? "nMinusOne" : "inner";
}

function weightOf(kind: ShieldingKind, target: SlaterGroupId): number {
  switch (kind) {
    case "sameGroup":
      return target === "1s" ? SLATER_WEIGHTS.sameGroup1s : SLATER_WEIGHTS.sameGroup;
    case "nMinusOne":
      return SLATER_WEIGHTS.nMinusOne;
    case "inner":
      return SLATER_WEIGHTS.inner;
    default:
      return 0;
  }
}

/** Itemised Slater shielding of one electron in `target` (default: the outermost electron). */
export function shielding(
  z: number,
  configuration: readonly Subshell[],
  target: SlaterGroupId = outermostGroup(configuration),
): ShieldingResult {
  const counts = groupCounts(configuration);
  const contributions = occupiedGroups(configuration).map((group) => {
    const kind = shieldingKind(group, target);
    const count = kind === "sameGroup" ? counts[group] - 1 : counts[group];
    const perElectron = weightOf(kind, target);
    return { group, count, kind, perElectron, total: count * perElectron };
  });
  const s = contributions.reduce((sum, contribution) => sum + contribution.total, 0);
  // Round away floating-point noise (0.35 × 7 = 2.4499999…) so readouts and tests are exact.
  const rounded = Math.round(s * 1e6) / 1e6;
  return { z, target, contributions, s: rounded, zEff: Math.round((z - rounded) * 1e6) / 1e6 };
}
