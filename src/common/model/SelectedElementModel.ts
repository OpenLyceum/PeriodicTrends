/**
 * SelectedElementModel.ts
 *
 * The element both screens share. One instance is created in main.ts and passed to each screen
 * model, so the element picked on the Trends screen is the one the Shielding screen explains.
 */

import { NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { DEFAULT_ELEMENT_Z } from "../../PeriodicTrendsConstants.js";
import { MAX_Z, MIN_Z } from "./ElementData.js";

export class SelectedElementModel {
  /** Atomic number of the shared element, 1–36. */
  public readonly zProperty = new NumberProperty(DEFAULT_ELEMENT_Z, {
    numberType: "Integer",
    range: new Range(MIN_Z, MAX_Z),
  });

  public reset(): void {
    this.zProperty.reset();
  }
}
