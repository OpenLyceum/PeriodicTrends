import { EnumerationProperty } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import { PeriodicProperty } from "../../../src/common/model/PeriodicProperty.js";
import { SelectedElementModel } from "../../../src/common/model/SelectedElementModel.js";
import { TableExtent } from "../../../src/common/model/TableExtent.js";
import { singleSelection } from "../../../src/common/model/TrendSelection.js";
import { TrendsModel } from "../../../src/trends/model/TrendsModel.js";

function createModel() {
  const extent = new EnumerationProperty(TableExtent.RADON);
  const shared = new SelectedElementModel(extent);
  return { extent, shared, model: new TrendsModel(shared) };
}

describe("TrendsModel shared selection", () => {
  it("initializes the shared element to the selection anchor", () => {
    const { model, shared } = createModel();
    expect(model.selectionProperty.value.anchorZ).toBe(3);
    expect(shared.zProperty.value).toBe(3);
  });

  it("resets the selection, property and overlay while keeping the shared anchor consistent", () => {
    const { model, shared } = createModel();
    model.select(singleSelection(86));
    model.periodicPropertyProperty.value = PeriodicProperty.ATOMIC_RADIUS;
    model.showZEffProperty.value = false;
    model.reset();
    expect(model.selectionProperty.value.zs).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    expect(shared.zProperty.value).toBe(3);
    expect(model.periodicPropertyProperty.value).toBe(PeriodicProperty.IONIZATION_ENERGY);
    expect(model.showZEffProperty.value).toBe(true);
    // Reset must also synchronize after Shielding changes the shared element,
    // even when the Trends selection is already the default.
    shared.zProperty.value = 17;
    model.reset();
    expect(shared.zProperty.value).toBe(3);
  });

  it("synchronizes the default anchor when the table shrinks past the selection", () => {
    const { model, shared, extent } = createModel();
    model.select(singleSelection(86));
    extent.value = TableExtent.KRYPTON;
    expect(model.selectionProperty.value.anchorZ).toBe(3);
    expect(shared.zProperty.value).toBe(3);
  });
});
