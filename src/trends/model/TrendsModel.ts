/**
 * TrendsModel.ts
 *
 * State of the Trends screen: the property mapped across the table, what is selected (one
 * element, a period run or a group run), and whether Z_eff is overlaid on the graph. There is no
 * time evolution; step() does nothing.
 */

import { BooleanProperty, EnumerationProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { PeriodicProperty } from "../../common/model/PeriodicProperty.js";
import type { SelectedElementModel } from "../../common/model/SelectedElementModel.js";
import { periodSelection, selectionsEqual, type TrendSelection } from "../../common/model/TrendSelection.js";
import { DEFAULT_PERIOD } from "../../PeriodicTrendsConstants.js";

export class TrendsModel implements TModel {
  /** The quantity coloured on the table and plotted on the graph. */
  public readonly periodicPropertyProperty = new EnumerationProperty(PeriodicProperty.IONIZATION_ENERGY);

  /** The current selection; opens on period 2 so a trend is visible straight away. */
  public readonly selectionProperty = new Property<TrendSelection>(periodSelection(DEFAULT_PERIOD), {
    valueComparisonStrategy: selectionsEqual,
  });

  /** Overlay the outer electron's Z_eff on the graph. */
  public readonly showZEffProperty = new BooleanProperty(true);

  public readonly selectedElement: SelectedElementModel;

  public constructor(selectedElement: SelectedElementModel) {
    this.selectedElement = selectedElement;
  }

  /** Selects a run or element; its anchor becomes the element the Shielding screen shows. */
  public select(selection: TrendSelection): void {
    this.selectionProperty.value = selection;
    this.selectedElement.zProperty.value = selection.anchorZ;
  }

  public reset(): void {
    this.periodicPropertyProperty.reset();
    this.selectionProperty.reset();
    this.showZEffProperty.reset();
    this.selectedElement.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
