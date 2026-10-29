/**
 * ElementData.test.ts
 *
 * Integrity of the H–Kr table: placement, configurations, and which values are deliberately
 * missing.
 */

import { describe, expect, it } from "vitest";
import {
  ELEMENTS,
  elementAt,
  elementsInGroup,
  elementsInPeriod,
  getElement,
  UNBOUND,
} from "../../src/common/model/ElementData.js";

describe("ElementData", () => {
  it("has 36 elements with contiguous Z", () => {
    expect(ELEMENTS).toHaveLength(36);
    expect(ELEMENTS.map((element) => element.z)).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it("places elements in the right period and group", () => {
    expect(elementAt(1, 18)?.symbol).toBe("He");
    expect(elementAt(2, 13)?.symbol).toBe("B");
    expect(elementAt(3, 17)?.symbol).toBe("Cl");
    expect(elementAt(4, 3)?.symbol).toBe("Sc");
    expect(elementAt(4, 12)?.symbol).toBe("Zn");
    expect(elementAt(3, 5)).toBeNull();
    expect(elementsInPeriod(4)).toHaveLength(18);
    expect(elementsInGroup(1).map((e) => e.symbol)).toEqual(["H", "Li", "Na", "K"]);
    expect(elementsInGroup(18).map((e) => e.symbol)).toEqual(["He", "Ne", "Ar", "Kr"]);
  });

  it("has configurations that sum to Z", () => {
    for (const element of ELEMENTS) {
      expect(element.configuration.reduce((sum, s) => sum + s.count, 0)).toBe(element.z);
    }
  });

  it("uses the 4s¹ configurations of Cr and Cu", () => {
    const fourS = (z: number) => getElement(z).configuration.find((s) => s.n === 4 && s.l === 0)?.count;
    const threeD = (z: number) => getElement(z).configuration.find((s) => s.n === 3 && s.l === 2)?.count;
    expect([fourS(24), threeD(24)]).toEqual([1, 5]);
    expect([fourS(29), threeD(29)]).toEqual([1, 10]);
    expect([fourS(25), threeD(25)]).toEqual([2, 5]);
  });

  it("leaves electronegativity undefined only for He, Ne and Ar", () => {
    expect(ELEMENTS.filter((e) => e.electronegativity === null).map((e) => e.symbol)).toEqual(["He", "Ne", "Ar"]);
  });

  it("marks exactly the atoms without a stable anion", () => {
    expect(ELEMENTS.filter((e) => e.electronAffinity === UNBOUND).map((e) => e.symbol)).toEqual([
      "He",
      "Be",
      "N",
      "Ne",
      "Mg",
      "Ar",
      "Mn",
      "Zn",
      "Kr",
    ]);
  });
});
