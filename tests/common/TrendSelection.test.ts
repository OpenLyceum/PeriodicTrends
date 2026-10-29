/**
 * TrendSelection.test.ts
 *
 * Drag-to-selection logic: axis snapping, clamping, skipping empty slots, keyboard stepping, and
 * the lanthanide row on the table through radon.
 */

import { describe, expect, it } from "vitest";
import { TableExtent } from "../../src/common/model/TableExtent.js";
import {
  groupSelection,
  periodSelection,
  selectionFits,
  selectionFromDrag,
  stepCell,
} from "../../src/common/model/TrendSelection.js";

const KR = TableExtent.KRYPTON;
const RN = TableExtent.RADON;

describe("selectionFromDrag", () => {
  it("is a single element when the pointer stays on the anchor", () => {
    expect(selectionFromDrag(KR, { row: 3, column: 1 }, { row: 3, column: 1 })).toEqual({
      kind: "single",
      zs: [11],
      anchorZ: 11,
    });
  });

  it("snaps to a period run and skips the d-block gap", () => {
    const selection = selectionFromDrag(KR, { row: 3, column: 1 }, { row: 4, column: 17 });
    expect(selection.kind).toBe("period");
    expect(selection.zs).toEqual([11, 12, 13, 14, 15, 16, 17]);
  });

  it("orders a right-to-left drag by increasing Z", () => {
    expect(selectionFromDrag(KR, { row: 2, column: 18 }, { row: 2, column: 13 }).zs).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it("snaps to a group run and clamps beyond the table", () => {
    const selection = selectionFromDrag(KR, { row: 1, column: 1 }, { row: 9, column: 2 });
    expect(selection.kind).toBe("group");
    expect(selection.zs).toEqual([1, 3, 11, 19]);
    expect(selectionFromDrag(RN, { row: 1, column: 1 }, { row: 9, column: 2 }).zs).toEqual([1, 3, 11, 19, 37, 55]);
  });

  it("treats a one-element run as a single selection", () => {
    expect(selectionFromDrag(KR, { row: 4, column: 5 }, { row: 1, column: 5 }).kind).toBe("single");
    expect(groupSelection(KR, 7).kind).toBe("single");
  });

  it("rejects a drag that starts on an empty slot or the lanthanide placeholder", () => {
    expect(() => selectionFromDrag(KR, { row: 1, column: 5 }, { row: 2, column: 5 })).toThrow();
    expect(() => selectionFromDrag(RN, { row: 6, column: 3 }, { row: 6, column: 5 })).toThrow();
  });

  it("takes in La–Lu when a period-6 drag spans the placeholder", () => {
    const zs = selectionFromDrag(RN, { row: 6, column: 2 }, { row: 6, column: 4 }).zs;
    expect(zs).toEqual([56, ...Array.from({ length: 15 }, (_, i) => 57 + i), 72]);
  });

  it("keeps a drag that starts in the lanthanide row in that row", () => {
    const selection = selectionFromDrag(RN, { row: 7, column: 3 }, { row: 5, column: 5 });
    expect(selection.kind).toBe("period");
    expect(selection.zs).toEqual([57, 58, 59]);
  });
});

describe("whole periods and groups", () => {
  it("covers the period or group on the table shown", () => {
    expect(periodSelection(KR, 1).zs).toEqual([1, 2]);
    expect(groupSelection(KR, 17).zs).toEqual([9, 17, 35]);
    expect(groupSelection(RN, 17).zs).toEqual([9, 17, 35, 53, 85]);
    expect(groupSelection(RN, 3).zs).toEqual([21, 39]);
    expect(periodSelection(RN, 6).zs).toHaveLength(32);
  });

  it("knows when a selection runs off a smaller table", () => {
    expect(selectionFits(KR, groupSelection(RN, 1))).toBe(false);
    expect(selectionFits(KR, groupSelection(KR, 1))).toBe(true);
  });
});

describe("stepCell", () => {
  it("skips empty slots and stops at the edge", () => {
    expect(stepCell(KR, { row: 2, column: 2 }, 0, 1)).toEqual({ row: 2, column: 13 });
    expect(stepCell(KR, { row: 4, column: 5 }, 1, 0)).toEqual({ row: 4, column: 5 });
    expect(stepCell(KR, { row: 1, column: 1 }, 0, 1)).toEqual({ row: 1, column: 18 });
  });

  it("skips the placeholder, and steps down from Y to La", () => {
    expect(stepCell(RN, { row: 6, column: 2 }, 0, 1)).toEqual({ row: 6, column: 4 });
    expect(stepCell(RN, { row: 5, column: 3 }, 1, 0)).toEqual({ row: 7, column: 3 });
  });
});
