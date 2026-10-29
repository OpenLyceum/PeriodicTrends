/**
 * TableExtent.ts
 *
 * How much of the periodic table the sim shows (a preference): through krypton (Z = 1–36, the Gen
 * Chem default), through xenon (1–54, adding the second transition series), or through radon
 * (1–86, adding the third transition series and the lanthanides in their own row). Every lookup
 * that depends on what is on the table (cells, periods, groups, colour scales) goes through the
 * current extent.
 *
 * Grid positions are (row, column): rows 1–6 are periods, LANTHANIDE_ROW holds La–Lu, and the
 * period-6 group-3 slot is a placeholder for them.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import {
  ELEMENTS,
  type ElementData,
  FIRST_LANTHANIDE,
  LANTHANIDE_FIRST_COLUMN,
  LANTHANIDE_ROW,
} from "./ElementData.js";

/** Grid slot of the lanthanide placeholder in period 6. */
export const LANTHANIDE_PLACEHOLDER = { row: 6, column: LANTHANIDE_FIRST_COLUMN } as const;

export class TableExtent extends EnumerationValue {
  public static readonly KRYPTON = new TableExtent(36);
  public static readonly XENON = new TableExtent(54);
  public static readonly RADON = new TableExtent(86);

  public static readonly enumeration = new Enumeration(TableExtent);

  /** Last element shown. */
  public readonly maxZ: number;
  /** Elements shown, in Z order. */
  public readonly elements: readonly ElementData[];
  /** Number of periods shown. */
  public readonly periodCount: number;
  /** Whether the lanthanide row (and its placeholder in group 3) is shown. */
  public readonly hasLanthanides: boolean;
  /** Grid rows, counting the lanthanide row when shown. */
  public readonly rowCount: number;

  public constructor(maxZ: number) {
    super();
    this.maxZ = maxZ;
    this.elements = ELEMENTS.filter((element) => element.z <= maxZ);
    this.periodCount = Math.max(...this.elements.map((element) => element.period));
    this.hasLanthanides = maxZ >= FIRST_LANTHANIDE;
    this.rowCount = this.hasLanthanides ? LANTHANIDE_ROW : this.periodCount;
  }

  public includes(z: number): boolean {
    return z >= 1 && z <= this.maxZ;
  }

  /** The element at grid slot (row, column), or null for an empty slot or the placeholder. */
  public elementAt(row: number, column: number): ElementData | null {
    return this.elements.find((element) => element.row === row && element.column === column) ?? null;
  }

  /** Whether (row, column) is the lanthanide placeholder on this table. */
  public isPlaceholder(row: number, column: number): boolean {
    return this.hasLanthanides && row === LANTHANIDE_PLACEHOLDER.row && column === LANTHANIDE_PLACEHOLDER.column;
  }

  /** Elements of one period in Z order (period 6 includes the lanthanides). */
  public elementsInPeriod(period: number): ElementData[] {
    return this.elements.filter((element) => element.period === period);
  }

  /** Elements of one group, top to bottom (lanthanides belong to no group). */
  public elementsInGroup(group: number): ElementData[] {
    return this.elements.filter((element) => element.group === group);
  }

  /** Elements on one grid row, left to right. */
  public elementsInRow(row: number): ElementData[] {
    return this.elements.filter((element) => element.row === row).sort((a, b) => a.column - b.column);
  }
}
