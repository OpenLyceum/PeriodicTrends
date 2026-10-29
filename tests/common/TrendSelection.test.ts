/**
 * TrendSelection.test.ts
 *
 * Drag-to-selection logic: axis snapping, clamping, skipping empty slots, keyboard stepping.
 */

import { describe, expect, it } from "vitest";
import { groupSelection, periodSelection, selectionFromDrag, stepCell } from "../../src/common/model/TrendSelection.js";

describe("selectionFromDrag", () => {
  it("is a single element when the pointer stays on the anchor", () => {
    expect(selectionFromDrag({ period: 3, group: 1 }, { period: 3, group: 1 })).toEqual({
      kind: "single",
      zs: [11],
      anchorZ: 11,
    });
  });

  it("snaps to a period run and skips the d-block gap", () => {
    const selection = selectionFromDrag({ period: 3, group: 1 }, { period: 4, group: 17 });
    expect(selection.kind).toBe("period");
    expect(selection.zs).toEqual([11, 12, 13, 14, 15, 16, 17]);
  });

  it("orders a right-to-left drag by increasing Z", () => {
    expect(selectionFromDrag({ period: 2, group: 18 }, { period: 2, group: 13 }).zs).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it("snaps to a group run and clamps beyond the table", () => {
    const selection = selectionFromDrag({ period: 1, group: 1 }, { period: 9, group: 2 });
    expect(selection.kind).toBe("group");
    expect(selection.zs).toEqual([1, 3, 11, 19]);
  });

  it("treats a one-element run as a single selection", () => {
    expect(selectionFromDrag({ period: 4, group: 5 }, { period: 1, group: 5 }).kind).toBe("single");
    expect(groupSelection(7).kind).toBe("single");
  });

  it("rejects a drag that starts on an empty slot", () => {
    expect(() => selectionFromDrag({ period: 1, group: 5 }, { period: 2, group: 5 })).toThrow();
  });
});

describe("whole periods and groups", () => {
  it("covers the period or group", () => {
    expect(periodSelection(1).zs).toEqual([1, 2]);
    expect(groupSelection(17).zs).toEqual([9, 17, 35]);
  });
});

describe("stepCell", () => {
  it("skips empty slots and stops at the edge", () => {
    expect(stepCell({ period: 2, group: 2 }, 0, 1)).toEqual({ period: 2, group: 13 });
    expect(stepCell({ period: 4, group: 5 }, -1, 0)).toEqual({ period: 4, group: 5 });
    expect(stepCell({ period: 1, group: 1 }, 0, 1)).toEqual({ period: 1, group: 18 });
  });
});
