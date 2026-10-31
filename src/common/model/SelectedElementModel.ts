/**
 * SelectedElementModel.ts
 *
 * The element both screens share, and how much of the table is shown (a preference). One instance
 * is created in main.ts and passed to each screen model, so the element picked on the Trends
 * screen is the one the Shielding screen explains. When the table shrinks, an element no longer on
 * it is replaced by the default.
 */

import { NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { DEFAULT_ELEMENT_Z } from "../../PeriodicTrendsConstants.js";
import { MIN_Z } from "./ElementData.js";
import type { TableExtent } from "./TableExtent.js";

export class SelectedElementModel {
  /** Atomic number of the shared element, within the table on show. */
  public readonly zProperty: NumberProperty;

  /** How much of the table is shown (Preferences). */
  public readonly tableExtentProperty: TReadOnlyProperty<TableExtent>;

  public constructor(tableExtentProperty: TReadOnlyProperty<TableExtent>) {
    this.tableExtentProperty = tableExtentProperty;
    this.zProperty = new NumberProperty(DEFAULT_ELEMENT_Z, {
      numberType: "Integer",
      range: new Range(MIN_Z, tableExtentProperty.value.maxZ),
    });

    // Lives as long as the sim.
    tableExtentProperty.lazyLink((table) => {
      const z = table.includes(this.zProperty.value) ? this.zProperty.value : DEFAULT_ELEMENT_Z;
      this.zProperty.setValueAndRange(z, new Range(MIN_Z, table.maxZ));
    });
  }

  public reset(): void {
    // NumberProperty.reset also restores its initial range. The table preference can have
    // changed since startup, so reset the element within the current table instead.
    this.zProperty.setValueAndRange(DEFAULT_ELEMENT_Z, new Range(MIN_Z, this.tableExtentProperty.value.maxZ));
  }
}
