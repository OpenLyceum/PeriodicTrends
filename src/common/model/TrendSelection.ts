/**
 * TrendSelection.ts
 *
 * What the student has picked on the table: one element, a run across a period, or a run down a
 * group. A drag (or Shift+arrow extension) from an anchor cell to the current cell becomes a
 * period run when it moves more columns than rows, otherwise a group run. Runs are always ordered
 * by increasing Z, so "across" means left to right and "down" means top to bottom.
 *
 * Pure functions, no Scenery imports.
 */

import { elementAt, elementsInGroup, elementsInPeriod, GROUP_COUNT, PERIOD_COUNT } from "./ElementData.js";

export type SelectionKind = "single" | "period" | "group";

export type TrendSelection = {
  readonly kind: SelectionKind;
  /** Atomic numbers in plotting order (increasing Z). */
  readonly zs: readonly number[];
  /** The element the selection started from (the clicked or focused element). */
  readonly anchorZ: number;
};

/** A cell of the 4 × 18 grid; it may be an empty slot. */
export type GridCell = { readonly period: number; readonly group: number };

export function singleSelection(z: number): TrendSelection {
  return { kind: "single", zs: [z], anchorZ: z };
}

/** The whole period, anchored on its first element unless `anchorZ` is given. */
export function periodSelection(period: number, anchorZ?: number): TrendSelection {
  const zs = elementsInPeriod(period).map((element) => element.z);
  return normalised({ kind: "period", zs, anchorZ: anchorZ ?? zs[0] ?? 1 });
}

/** The whole group, anchored on its first element unless `anchorZ` is given. */
export function groupSelection(group: number, anchorZ?: number): TrendSelection {
  const zs = elementsInGroup(group).map((element) => element.z);
  return normalised({ kind: "group", zs, anchorZ: anchorZ ?? zs[0] ?? 1 });
}

/** A one-element run is just a single selection. */
function normalised(selection: TrendSelection): TrendSelection {
  return selection.zs.length === 1 ? singleSelection(selection.zs[0] ?? selection.anchorZ) : selection;
}

export function clampCell(cell: GridCell): GridCell {
  return {
    period: Math.min(PERIOD_COUNT, Math.max(1, cell.period)),
    group: Math.min(GROUP_COUNT, Math.max(1, cell.group)),
  };
}

/**
 * The selection made by dragging from `anchor` (an occupied cell) to `current` (any cell, clamped
 * to the grid). Empty slots between the two ends are skipped.
 */
export function selectionFromDrag(anchor: GridCell, current: GridCell): TrendSelection {
  const anchorElement = elementAt(anchor.period, anchor.group);
  if (!anchorElement) {
    throw new Error("A drag must start on an element");
  }
  const end = clampCell(current);
  const dRows = Math.abs(end.period - anchor.period);
  const dColumns = Math.abs(end.group - anchor.group);
  if (dRows === 0 && dColumns === 0) {
    return singleSelection(anchorElement.z);
  }
  if (dColumns >= dRows) {
    const lo = Math.min(anchor.group, end.group);
    const hi = Math.max(anchor.group, end.group);
    const zs = elementsInPeriod(anchor.period)
      .filter((element) => element.group >= lo && element.group <= hi)
      .map((element) => element.z);
    return normalised({ kind: "period", zs, anchorZ: anchorElement.z });
  }
  const lo = Math.min(anchor.period, end.period);
  const hi = Math.max(anchor.period, end.period);
  const zs = elementsInGroup(anchor.group)
    .filter((element) => element.period >= lo && element.period <= hi)
    .map((element) => element.z);
  return normalised({ kind: "group", zs, anchorZ: anchorElement.z });
}

/**
 * The occupied cell reached by moving one step from `cell` in direction (dPeriod, dGroup),
 * skipping empty slots; `cell` itself if there is none.
 */
export function stepCell(cell: GridCell, dPeriod: number, dGroup: number): GridCell {
  let period = cell.period + dPeriod;
  let group = cell.group + dGroup;
  while (period >= 1 && period <= PERIOD_COUNT && group >= 1 && group <= GROUP_COUNT) {
    if (elementAt(period, group)) {
      return { period, group };
    }
    period += dPeriod;
    group += dGroup;
  }
  return cell;
}

export function selectionsEqual(a: TrendSelection, b: TrendSelection): boolean {
  return (
    a.kind === b.kind && a.anchorZ === b.anchorZ && a.zs.length === b.zs.length && a.zs.every((z, i) => z === b.zs[i])
  );
}
