/**
 * Slater.test.ts
 *
 * Textbook Slater's-rules values for the outermost (and one 3d) electron.
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
  ])("Z = %i has outer Z_eff %f", (z, expected) => {
    expect(zEff(z)).toBeCloseTo(expected, 6);
  });

  it("gives Zn 3d Z_eff = 8.85", () => {
    expect(zEff(30, "3d")).toBeCloseTo(8.85, 6);
  });
});
