/**
 * TrendAnomalies.test.ts
 *
 * The main trends hold in the data except where TrendAnomalies says they don't, and every listed
 * reversal really is one. This guards ElementData and the anomaly list against typos.
 */

import { describe, expect, it } from "vitest";
import { ELEMENTS, elementsInGroup, getElement } from "../../src/common/model/ElementData.js";
import { PeriodicProperty } from "../../src/common/model/PeriodicProperty.js";
import { anomaliesFor, anomalyPosition, TREND_ANOMALIES } from "../../src/common/model/TrendAnomalies.js";
import { groupSelection, periodSelection, singleSelection } from "../../src/common/model/TrendSelection.js";

/** Radii that differ by this much or less are within the data's uncertainty (pm). */
const RADIUS_TOLERANCE = 2;

const value = (property: PeriodicProperty, z: number) => property.getNumericValue(getElement(z));

const isListed = (property: PeriodicProperty, from: number, to: number) =>
  TREND_ANOMALIES.some(
    (a) =>
      a.property === property &&
      ((a.kind === "pair" && a.fromZ === from && a.toZ === to) ||
        (a.kind === "range" && from >= a.fromZ && to <= a.toZ)),
  );

describe("periodic trends hold except for listed anomalies", () => {
  const mainGroupRuns = [2, 3, 4].map((period) =>
    ELEMENTS.filter((e) => e.period === period && e.block !== "d").map((e) => e.z),
  );

  it("ionization energy rises across each period", () => {
    for (const run of mainGroupRuns) {
      for (let i = 0; i + 1 < run.length; i++) {
        const [a, b] = [run[i] ?? 0, run[i + 1] ?? 0];
        const exception = isListed(PeriodicProperty.IONIZATION_ENERGY, a, b) || (a === 20 && b === 31);
        if (!exception) {
          expect(value(PeriodicProperty.IONIZATION_ENERGY, b), `${a}→${b}`).toBeGreaterThan(
            value(PeriodicProperty.IONIZATION_ENERGY, a) ?? 0,
          );
        }
      }
    }
  });

  it("radius shrinks across each period, within uncertainty", () => {
    for (const run of mainGroupRuns) {
      for (let i = 0; i + 1 < run.length; i++) {
        const [a, b] = [run[i] ?? 0, run[i + 1] ?? 0];
        if (!isListed(PeriodicProperty.ATOMIC_RADIUS, a, b)) {
          expect(value(PeriodicProperty.ATOMIC_RADIUS, b), `${a}→${b}`).toBeLessThanOrEqual(
            (value(PeriodicProperty.ATOMIC_RADIUS, a) ?? 0) + RADIUS_TOLERANCE,
          );
        }
      }
    }
  });

  it("radius grows and ionization energy falls down the main groups", () => {
    for (const group of [1, 2, 13, 14, 15, 16, 17, 18]) {
      const zs = elementsInGroup(group).map((e) => e.z);
      for (let i = 0; i + 1 < zs.length; i++) {
        const [a, b] = [zs[i] ?? 0, zs[i + 1] ?? 0];
        if (!isListed(PeriodicProperty.ATOMIC_RADIUS, a, b)) {
          expect(value(PeriodicProperty.ATOMIC_RADIUS, b), `r ${a}→${b}`).toBeGreaterThan(
            value(PeriodicProperty.ATOMIC_RADIUS, a) ?? 0,
          );
        }
        if (!isListed(PeriodicProperty.IONIZATION_ENERGY, a, b)) {
          expect(value(PeriodicProperty.IONIZATION_ENERGY, b), `IE ${a}→${b}`).toBeLessThan(
            value(PeriodicProperty.IONIZATION_ENERGY, a) ?? 0,
          );
        }
      }
    }
  });
});

describe("every listed pair is a real exception", () => {
  for (const anomaly of TREND_ANOMALIES.filter((a) => a.kind === "pair")) {
    const from = getElement(anomaly.fromZ);
    const to = getElement(anomaly.toZ);
    it(`${anomaly.property.key}: ${from.symbol} → ${to.symbol}`, () => {
      const a = anomaly.property.getNumericValue(from) ?? 0;
      const b = anomaly.property.getNumericValue(to) ?? 0;
      const down = from.group === to.group;
      // Expected direction: radius falls across / rises down; the others rise across / fall down.
      const radius = anomaly.property === PeriodicProperty.ATOMIC_RADIUS;
      const expectedUp = radius ? down : !down;
      if (radius && down) {
        // Ga is barely larger than Al: "no growth" within uncertainty.
        expect(b - a).toBeLessThanOrEqual(RADIUS_TOLERANCE);
      } else if (expectedUp) {
        expect(b).toBeLessThan(a);
      } else {
        expect(b).toBeGreaterThan(a);
      }
    });
  }
});

describe("anomaliesFor", () => {
  it("finds Be→B and N→O on period 2 ionization energy", () => {
    const keys = anomaliesFor(periodSelection(2), PeriodicProperty.IONIZATION_ENERGY).map((a) => a.key);
    expect(keys).toEqual(["pBelowS", "pairing"]);
  });

  it("finds the d-contraction down group 13 and places it between Al and Ga", () => {
    const selection = groupSelection(13);
    const [anomaly] = anomaliesFor(selection, PeriodicProperty.ELECTRONEGATIVITY);
    expect(anomaly?.key).toBe("dContraction");
    expect(anomaly && anomalyPosition(anomaly, selection.zs)).toBe(1.5);
  });

  it("matches a single element to its anomalies", () => {
    expect(anomaliesFor(singleSelection(8), PeriodicProperty.IONIZATION_ENERGY).map((a) => a.key)).toEqual(["pairing"]);
    expect(anomaliesFor(singleSelection(26), PeriodicProperty.ATOMIC_RADIUS).map((a) => a.key)).toEqual(["dBlockFlat"]);
  });
});
