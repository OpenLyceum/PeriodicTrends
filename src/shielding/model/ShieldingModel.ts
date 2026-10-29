/**
 * ShieldingModel.ts
 *
 * State of the Shielding screen: the element (shared with Trends) and which electron's shielding
 * is itemised. Choosing a new element resets the target to its outermost electron. There is no
 * time evolution; step() does nothing.
 */

import { DerivedProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { type ElementData, getElement } from "../../common/model/ElementData.js";
import type { SelectedElementModel } from "../../common/model/SelectedElementModel.js";
import { outermostGroup, type ShieldingResult, type SlaterGroupId, shielding } from "../../common/model/Slater.js";

export class ShieldingModel implements TModel {
  public readonly elementProperty: TReadOnlyProperty<ElementData>;

  /** The Slater group of the electron whose shielding is shown. */
  public readonly targetGroupProperty: Property<SlaterGroupId>;

  public readonly shieldingProperty: TReadOnlyProperty<ShieldingResult>;

  public readonly selectedElement: SelectedElementModel;

  public constructor(selectedElement: SelectedElementModel) {
    this.selectedElement = selectedElement;
    this.elementProperty = new DerivedProperty([selectedElement.zProperty], getElement);
    this.targetGroupProperty = new Property<SlaterGroupId>(outermostGroup(this.elementProperty.value.configuration));

    // A new element starts from its valence electron. The model lives for the whole sim, so this
    // link is never removed.
    this.elementProperty.lazyLink((element) => {
      this.targetGroupProperty.value = outermostGroup(element.configuration);
    });

    this.shieldingProperty = new DerivedProperty([this.elementProperty, this.targetGroupProperty], (element, target) =>
      shielding(element.z, element.configuration, target),
    );
  }

  /** Steps the shared element by `delta` in Z, staying within 1–36. */
  public stepElement(delta: number): void {
    const zProperty = this.selectedElement.zProperty;
    const range = zProperty.range;
    zProperty.value = Math.min(range.max, Math.max(range.min, zProperty.value + delta));
  }

  public reset(): void {
    this.selectedElement.reset();
    this.targetGroupProperty.value = outermostGroup(this.elementProperty.value.configuration);
  }

  public step(_dt: number): void {
    // Nothing evolves in time.
  }
}
