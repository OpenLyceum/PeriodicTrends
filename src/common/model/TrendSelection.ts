/**
 * TrendSelection.ts
 *
 * What the student has picked on the table: one element, a run across a period, or a run down a
 * group. A drag (or Shift+arrow extension) from an anchor cell to the current cell becomes a
 * period run when it moves more columns than rows, otherwise a group run. Runs are always ordered
 * by increasing Z, so "across" means left to right and "down" means top to bottom. Everything is
 * relative to the TableExtent on show.
 *
 * Pure functions, no Scenery imports.
 */

import { GROUP_COUNT, LANTHANIDE_ROW } from "./ElementData.js";
import { LANTHANIDE_PLACEHOLDER, type TableExtent } from "./TableExtent.js";

export type SelectionKind = "single" | "period" | "group";

export type TrendSelection = {
  readonly kind: SelectionKind;
  /** Atomic numbers in plotting order (increasing Z). */
  readonly zs: readonly number[];
  /** The element the selection started from (the clicked or focused element). */
  readonly anchorZ: number;
};

/** A slot of the table grid (row = period, or the lanthanide row); it may be empty. */
export type GridCell = { readonly row: number; readonly column: number };

export function singleSelection(z: number): TrendSelection {
  return { kind: "single", zs: [z], anchorZ: z };
}

/** The whole period (period 6 includes the lanthanides), anchored on its first element unless `anchorZ` is given. */
export function periodSelection(table: TableExtent, period: number, anchorZ?: number): TrendSelection {
  const zs = table.elementsInPeriod(period).map((element) => element.z);
  return normalised({ kind: "period", zs, anchorZ: anchorZ ?? zs[0] ?? 1 });
}

/** The whole group, anchored on its first element unless `anchorZ` is given. */
export function groupSelection(table: TableExtent, group: number, anchorZ?: number): TrendSelection {
  const zs = table.elementsInGroup(group).map((element) => element.z);
  return normalised({ kind: "group", zs, anchorZ: anchorZ ?? zs[0] ?? 1 });
}

/** A one-element run is just a single selection. */
function normalised(selection: TrendSelection): TrendSelection {
  return selection.zs.length === 1 ? singleSelection(selection.zs[0] ?? selection.anchorZ) : selection;
}

export function clampCell(table: TableExtent, cell: GridCell): GridCell {
  return {
    row: Math.min(table.rowCount, Math.max(1, cell.row)),
    column: Math.min(GROUP_COUNT, Math.max(1, cell.column)),
  };
}

/** Elements on `row` between columns lo and hi; on period 6 a span over the placeholder takes in La–Lu. */
function rowRun(table: TableExtent, row: number, lo: number, hi: number): number[] {
  const zs = table
    .elementsInRow(row)
    .filter((element) => element.column >= lo && element.column <= hi)
    .map((element) => element.z);
  const placeholder = LANTHANIDE_PLACEHOLDER;
  if (table.isPlaceholder(row, placeholder.column) && lo <= placeholder.column && hi >= placeholder.column) {
    zs.push(...table.elementsInRow(LANTHANIDE_ROW).map((element) => element.z));
  }
  return zs.sort((a, b) => a - b);
}

/**
 * The selection made by dragging from `anchor` (an occupied cell) to `current` (any cell, clamped
 * to the grid). Empty slots between the two ends are skipped. A drag that starts in the
 * lanthanide row stays in it, since the lanthanides belong to no group.
 */
export function selectionFromDrag(table: TableExtent, anchor: GridCell, current: GridCell): TrendSelection {
  const anchorElement = table.elementAt(anchor.row, anchor.column);
  if (!anchorElement) {
    throw new Error("A drag must start on an element");
  }
  const end = clampCell(table, current);
  const dRows = Math.abs(end.row - anchor.row);
  const dColumns = Math.abs(end.column - anchor.column);
  if (dRows === 0 && dColumns === 0) {
    return singleSelection(anchorElement.z);
  }
  if (dColumns >= dRows || anchorElement.group === null) {
    const lo = Math.min(anchor.column, end.column);
    const hi = Math.max(anchor.column, end.column);
    return normalised({ kind: "period", zs: rowRun(table, anchor.row, lo, hi), anchorZ: anchorElement.z });
  }
  const lo = Math.min(anchor.row, end.row);
  const hi = Math.max(anchor.row, end.row);
  const zs = table
    .elementsInGroup(anchorElement.group)
    .filter((element) => element.row >= lo && element.row <= hi)
    .map((element) => element.z);
  return normalised({ kind: "group", zs, anchorZ: anchorElement.z });
}

/**
 * The occupied cell reached by moving one step from `cell` in direction (dRow, dColumn), skipping
 * empty slots and the lanthanide placeholder; `cell` itself if there is none.
 */
export function stepCell(table: TableExtent, cell: GridCell, dRow: number, dColumn: number): GridCell {
  let row = cell.row + dRow;
  let column = cell.column + dColumn;
  while (row >= 1 && row <= table.rowCount && column >= 1 && column <= GROUP_COUNT) {
    if (table.elementAt(row, column)) {
      return { row, column };
    }
    row += dRow;
    column += dColumn;
  }
  return cell;
}

/** True when every element of the selection is on the table. */
export function selectionFits(table: TableExtent, selection: TrendSelection): boolean {
  return selection.zs.every((z) => table.includes(z));
}

export function selectionsEqual(a: TrendSelection, b: TrendSelection): boolean {
  return (
    a.kind === b.kind && a.anchorZ === b.anchorZ && a.zs.length === b.zs.length && a.zs.every((z, i) => z === b.zs[i])
  );
}
