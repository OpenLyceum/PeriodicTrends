/**
 * ElementData.test.ts
 *
 * Integrity of the H–Rn table and of each table extent: placement, configurations, and which values
 * are deliberately missing.
 */

import { describe, expect, it } from "vitest";
import { ELEMENTS, getElement, shortConfigurationText, UNBOUND } from "../../src/common/model/ElementData.js";
import { TableExtent } from "../../src/common/model/TableExtent.js";

const KR = TableExtent.KRYPTON;
const RN = TableExtent.RADON;

describe("ElementData", () => {
  it("has 86 elements with contiguous Z", () => {
    expect(ELEMENTS).toHaveLength(86);
    expect(ELEMENTS.map((element) => element.z)).toEqual(Array.from({ length: 86 }, (_, i) => i + 1));
  });

  it("places elements in the right period and group", () => {
    expect(KR.elementAt(1, 18)?.symbol).toBe("He");
    expect(KR.elementAt(2, 13)?.symbol).toBe("B");
    expect(KR.elementAt(3, 17)?.symbol).toBe("Cl");
    expect(KR.elementAt(4, 3)?.symbol).toBe("Sc");
    expect(KR.elementAt(4, 12)?.symbol).toBe("Zn");
    expect(KR.elementAt(3, 5)).toBeNull();
    expect(KR.elementsInPeriod(4)).toHaveLength(18);
    expect(KR.elementsInGroup(1).map((e) => e.symbol)).toEqual(["H", "Li", "Na", "K"]);
    expect(KR.elementsInGroup(18).map((e) => e.symbol)).toEqual(["He", "Ne", "Ar", "Kr"]);
    expect(RN.elementsInGroup(18).map((e) => e.symbol)).toEqual(["He", "Ne", "Ar", "Kr", "Xe", "Rn"]);
    expect(RN.elementsInGroup(4).map((e) => e.symbol)).toEqual(["Ti", "Zr", "Hf"]);
    expect(RN.elementAt(6, 3)).toBeNull();
    expect(RN.isPlaceholder(6, 3)).toBe(true);
    expect(RN.elementAt(7, 3)?.symbol).toBe("La");
    expect(RN.elementAt(7, 17)?.symbol).toBe("Lu");
    expect(getElement(57).group).toBeNull();
    expect(getElement(71).block).toBe("f");
  });

  it("has extents that end at the noble gases", () => {
    expect(TableExtent.enumeration.values.map((extent) => extent.elements.at(-1)?.symbol)).toEqual(["Kr", "Xe", "Rn"]);
    expect(TableExtent.enumeration.values.map((extent) => extent.rowCount)).toEqual([4, 5, 7]);
  });

  it("has configurations that sum to Z", () => {
    for (const element of ELEMENTS) {
      expect(element.configuration.reduce((sum, s) => sum + s.count, 0)).toBe(element.z);
    }
  });

  it("uses the s¹ configurations of Cr, Cu, Mo, Ag and Au, and Pd 4d¹⁰", () => {
    const count = (z: number, n: number, l: number) =>
      getElement(z).configuration.find((s) => s.n === n && s.l === l)?.count ?? 0;
    expect([count(24, 4, 0), count(24, 3, 2)]).toEqual([1, 5]);
    expect([count(29, 4, 0), count(29, 3, 2)]).toEqual([1, 10]);
    expect([count(25, 4, 0), count(25, 3, 2)]).toEqual([2, 5]);
    expect([count(42, 5, 0), count(42, 4, 2)]).toEqual([1, 5]);
    expect([count(46, 5, 0), count(46, 4, 2)]).toEqual([0, 10]);
    expect([count(79, 6, 0), count(79, 5, 2), count(79, 4, 3)]).toEqual([1, 10, 14]);
    expect([count(64, 4, 3), count(64, 5, 2)]).toEqual([7, 1]);
  });

  it("writes long configurations with a noble-gas core", () => {
    expect(shortConfigurationText(getElement(11))).toBe("1s² 2s² 2p⁶ 3s¹");
    expect(shortConfigurationText(getElement(82))).toBe("[Xe] 6s² 4f¹⁴ 5d¹⁰ 6p²");
    expect(shortConfigurationText(getElement(47))).toBe("[Kr] 5s¹ 4d¹⁰");
  });

  it("leaves electronegativity undefined only for the noble gases He–Ar and Rn, and Pm, Eu, Tb, Yb", () => {
    expect(ELEMENTS.filter((e) => e.electronegativity === null).map((e) => e.symbol)).toEqual([
      "He",
      "Ne",
      "Ar",
      "Pm",
      "Eu",
      "Tb",
      "Yb",
      "Rn",
    ]);
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
      "Cd",
      "Xe",
      "Yb",
      "Hg",
      "Rn",
    ]);
  });
});
