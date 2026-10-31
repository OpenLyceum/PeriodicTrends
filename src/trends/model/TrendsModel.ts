/**
 * TrendsModel.ts
 *
 * State of the Trends screen: the property mapped across the table, what is selected (one
 * element, a period run or a group run), and whether Z_eff is overlaid on the graph. There is no
 * time evolution; step() does nothing.
 */

import { BooleanProperty, EnumerationProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { PeriodicProperty } from "../../common/model/PeriodicProperty.js";
import type { SelectedElementModel } from "../../common/model/SelectedElementModel.js";
import type { TableExtent } from "../../common/model/TableExtent.js";
import {
  periodSelection,
  selectionFits,
  selectionsEqual,
  type TrendSelection,
} from "../../common/model/TrendSelection.js";
import { DEFAULT_PERIOD } from "../../PeriodicTrendsConstants.js";

export class TrendsModel implements TModel {
  /** The quantity coloured on the table and plotted on the graph. */
  public readonly periodicPropertyProperty = new EnumerationProperty(PeriodicProperty.IONIZATION_ENERGY);

  /** The current selection; opens on period 2 so a trend is visible straight away. */
  public readonly selectionProperty: Property<TrendSelection>;

  /** How much of the table is shown (Preferences). */
  public readonly tableExtentProperty: TReadOnlyProperty<TableExtent>;

  /** Overlay the outer electron's Z_eff on the graph. */
  public readonly showZEffProperty = new BooleanProperty(true);

  public readonly selectedElement: SelectedElementModel;

  public constructor(selectedElement: SelectedElementModel) {
    this.selectedElement = selectedElement;
    this.tableExtentProperty = selectedElement.tableExtentProperty;
    this.selectionProperty = new Property<TrendSelection>(this.defaultSelection(), {
      valueComparisonStrategy: selectionsEqual,
    });
    this.select(this.selectionProperty.value);

    // A selection that runs off a smaller table starts over; one that fits stays. The model lives
    // as long as the sim, so this link is never removed.
    this.tableExtentProperty.lazyLink((table) => {
      if (!selectionFits(table, this.selectionProperty.value)) {
        this.select(this.defaultSelection());
      }
    });
  }

  private defaultSelection(): TrendSelection {
    return periodSelection(this.tableExtentProperty.value, DEFAULT_PERIOD);
  }

  /** Selects a run or element; its anchor becomes the element the Shielding screen shows. */
  public select(selection: TrendSelection): void {
    this.selectionProperty.value = selection;
    this.selectedElement.zProperty.value = selection.anchorZ;
  }

  public reset(): void {
    this.periodicPropertyProperty.reset();
    this.select(this.defaultSelection());
    this.showZEffProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
