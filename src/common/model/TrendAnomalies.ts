/**
 * TrendAnomalies.ts
 *
 * Places where the Z_eff-and-n story predicts the wrong direction, each with a short explanation
 * (in the strings files, keyed by `key`). A "pair" anomaly is a reversal between two elements; a
 * "range" anomaly covers a run (a d series, or the lanthanides) where the property changes
 * irregularly. Anomalies beyond krypton only show when the table extends that far.
 *
 * tests/common/TrendAnomalies.test.ts checks that every pair anomaly is a real reversal in
 * ElementData, which guards both lists against typos.
 */

import { PeriodicProperty } from "./PeriodicProperty.js";
import type { TrendSelection } from "./TrendSelection.js";

export type AnomalyKey =
  | "pBelowS"
  | "pairing"
  | "nobleGasRadius"
  | "dContraction"
  | "dBlockFlat"
  | "unboundAnion"
  | "halfFilledP"
  | "fluorineCrowded"
  | "newShell"
  | "filledS"
  | "relativistic"
  | "estimatedRadius"
  | "irregularEN"
  | "lanthanideContraction"
  | "lanthanideSeries";

export type TrendAnomaly = {
  readonly property: PeriodicProperty;
  readonly key: AnomalyKey;
  readonly kind: "pair" | "range";
  /** Pair: the two elements, in plotting order. Range: first and last Z of the run. */
  readonly fromZ: number;
  readonly toZ: number;
};

const IE = PeriodicProperty.IONIZATION_ENERGY;
const R = PeriodicProperty.ATOMIC_RADIUS;
const EA = PeriodicProperty.ELECTRON_AFFINITY;
const EN = PeriodicProperty.ELECTRONEGATIVITY;

function pair(property: PeriodicProperty, key: AnomalyKey, fromZ: number, toZ: number): TrendAnomaly {
  return { property, key, kind: "pair", fromZ, toZ };
}

function range(property: PeriodicProperty, key: AnomalyKey, fromZ: number, toZ: number): TrendAnomaly {
  return { property, key, kind: "range", fromZ, toZ };
}

export const TREND_ANOMALIES: readonly TrendAnomaly[] = [
  // Ionization energy dips across a period.
  pair(IE, "pBelowS", 4, 5), // Be → B
  pair(IE, "pBelowS", 12, 13), // Mg → Al
  pair(IE, "pBelowS", 30, 31), // Zn → Ga
  pair(IE, "pairing", 7, 8), // N → O
  pair(IE, "pairing", 15, 16), // P → S
  pair(IE, "pairing", 33, 34), // As → Se
  range(IE, "dBlockFlat", 21, 30),
  // Ionization energy down group 13: Ga is not lower than Al.
  pair(IE, "dContraction", 13, 31),
  // Periods 5 and 6 (the table through Xe or Rn).
  pair(IE, "pBelowS", 48, 49), // Cd → In
  pair(IE, "pBelowS", 80, 81), // Hg → Tl
  pair(IE, "relativistic", 82, 83), // Pb → Bi
  range(IE, "dBlockFlat", 39, 48),
  range(IE, "dBlockFlat", 72, 80),
  range(IE, "lanthanideSeries", 57, 71),
  pair(IE, "lanthanideContraction", 49, 81), // In → Tl
  pair(IE, "lanthanideContraction", 50, 82), // Sn → Pb

  // Atomic radius.
  pair(R, "nobleGasRadius", 9, 10), // F → Ne
  pair(R, "nobleGasRadius", 17, 18), // Cl → Ar
  range(R, "dBlockFlat", 21, 30),
  pair(R, "dContraction", 13, 31), // Al → Ga, no growth down the group
  range(R, "dBlockFlat", 39, 48),
  range(R, "dBlockFlat", 72, 80),
  range(R, "lanthanideSeries", 57, 71),
  pair(R, "estimatedRadius", 84, 85), // Po → At
  // Down the d-block, period 6 is no larger than period 5.
  pair(R, "lanthanideContraction", 40, 72), // Zr → Hf
  pair(R, "lanthanideContraction", 44, 76), // Ru → Os
  pair(R, "lanthanideContraction", 45, 77), // Rh → Ir
  pair(R, "lanthanideContraction", 46, 78), // Pd → Pt
  pair(R, "lanthanideContraction", 47, 79), // Ag → Au
  pair(R, "lanthanideContraction", 48, 80), // Cd → Hg

  // Electron affinity.
  pair(EA, "unboundAnion", 3, 4), // Li → Be
  pair(EA, "unboundAnion", 11, 12), // Na → Mg
  pair(EA, "halfFilledP", 6, 7), // C → N
  pair(EA, "halfFilledP", 14, 15), // Si → P
  pair(EA, "halfFilledP", 32, 33), // Ge → As
  pair(EA, "newShell", 9, 10), // F → Ne
  pair(EA, "newShell", 17, 18), // Cl → Ar
  pair(EA, "newShell", 35, 36), // Br → Kr
  pair(EA, "fluorineCrowded", 9, 17), // F → Cl down group 17
  pair(EA, "fluorineCrowded", 8, 16), // O → S down group 16
  range(EA, "dBlockFlat", 21, 30),
  pair(EA, "filledS", 19, 20), // K → Ca
  pair(EA, "filledS", 37, 38), // Rb → Sr
  pair(EA, "filledS", 55, 56), // Cs → Ba
  pair(EA, "halfFilledP", 50, 51), // Sn → Sb
  pair(EA, "newShell", 53, 54), // I → Xe
  pair(EA, "newShell", 85, 86), // At → Rn
  range(EA, "dBlockFlat", 39, 48),
  range(EA, "dBlockFlat", 72, 80),
  range(EA, "lanthanideSeries", 57, 71),

  range(EN, "dBlockFlat", 21, 30),
  // Electronegativity rises from period 3 to period 4 in groups 13 and 14.
  pair(EN, "dContraction", 13, 31), // Al → Ga
  pair(EN, "dContraction", 14, 32), // Si → Ge
  range(EN, "dBlockFlat", 39, 48),
  range(EN, "dBlockFlat", 72, 80),
  range(EN, "lanthanideSeries", 57, 71),
  pair(EN, "lanthanideContraction", 50, 82), // Sn → Pb
  pair(EN, "irregularEN", 82, 83), // Pb → Bi
  pair(EN, "irregularEN", 83, 84), // Bi → Po
];

/**
 * Anomalies relevant to a selection, in plotting order. A pair matches when both elements are
 * adjacent in a run (or when a single selection is either element); a range matches when at least
 * two of its elements are in a run (or when a single selection lies inside it).
 */
export function anomaliesFor(selection: TrendSelection, property: PeriodicProperty): TrendAnomaly[] {
  const zs = selection.zs;
  const matches = TREND_ANOMALIES.filter((anomaly) => {
    if (anomaly.property !== property) {
      return false;
    }
    if (selection.kind === "single") {
      const z = selection.anchorZ;
      return anomaly.kind === "pair"
        ? z === anomaly.fromZ || z === anomaly.toZ
        : z >= anomaly.fromZ && z <= anomaly.toZ;
    }
    if (anomaly.kind === "pair") {
      const i = zs.indexOf(anomaly.fromZ);
      return i >= 0 && zs[i + 1] === anomaly.toZ;
    }
    return zs.filter((z) => z >= anomaly.fromZ && z <= anomaly.toZ).length >= 2;
  });
  return matches.sort((a, b) => a.fromZ - b.fromZ);
}

/**
 * Plot position of an anomaly marker along a run: midway between a pair, or the middle of the
 * range's elements. Null when the anomaly is not on the run.
 */
export function anomalyPosition(anomaly: TrendAnomaly, zs: readonly number[]): number | null {
  if (anomaly.kind === "pair") {
    const i = zs.indexOf(anomaly.fromZ);
    return i >= 0 && zs[i + 1] === anomaly.toZ ? i + 0.5 : null;
  }
  const indices = zs.flatMap((z, i) => (z >= anomaly.fromZ && z <= anomaly.toZ ? [i] : []));
  const first = indices[0];
  const last = indices[indices.length - 1];
  return first === undefined || last === undefined ? null : (first + last) / 2;
}
