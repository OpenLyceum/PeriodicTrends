/**
 * Slater.test.ts
 *
 * Textbook Slater's-rules values for the outermost electron, and for d and f electrons, H–Rn.
 */

import { describe, expect, it } from "vitest";
import { getElement } from "../../src/common/model/ElementData.js";
import { shielding } from "../../src/common/model/Slater.js";

function zEff(z: number, target?: Parameters<typeof shielding>[2]): number {
  const element = getElement(z);
  return shielding(z, element.configuration, target).zEff;
}

describe("Slater's rules", () => {
  it.each([
    [1, 1.0],
    [2, 1.7],
    [7, 3.9],
    [8, 4.55],
    [17, 6.1],
    [19, 2.2],
    [26, 3.75],
    [29, 3.7],
    [30, 4.35],
    [37, 2.2],
    [47, 3.7],
    [53, 7.6],
    [79, 3.7],
  ])("Z = %i has outer Z_eff %f", (z, expected) => {
    expect(zEff(z)).toBeCloseTo(expected, 6);
  });

  it("gives Zn 3d Z_eff = 8.85", () => {
    expect(zEff(30, "3d")).toBeCloseTo(8.85, 6);
  });

  it("treats 4d and 4f electrons like 3d: 0.35 within the group, 1.00 for everything inside", () => {
    expect(zEff(47, "4d")).toBeCloseTo(7.85, 6);
    expect(zEff(64, "4f")).toBeCloseTo(15.9, 6);
  });
});
