import { EnumerationProperty } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import { SelectedElementModel } from "../../src/common/model/SelectedElementModel.js";
import { TableExtent } from "../../src/common/model/TableExtent.js";

describe("SelectedElementModel reset after an extent change", () => {
  for (const [initial, current] of [
    [TableExtent.KRYPTON, TableExtent.RADON],
    [TableExtent.RADON, TableExtent.KRYPTON],
  ] as const) {
    it(`keeps the current ${current.maxZ}-element range instead of the initial ${initial.maxZ}-element range`, () => {
      const extent = new EnumerationProperty(initial);
      const model = new SelectedElementModel(extent);
      extent.value = current;
      model.zProperty.value = current.maxZ;
      model.reset();
      expect(model.zProperty.value).toBe(17);
      expect(model.zProperty.range.min).toBe(1);
      expect(model.zProperty.range.max).toBe(current.maxZ);
      model.zProperty.value = current.maxZ;
      expect(model.zProperty.value).toBe(current.maxZ);
    });
  }
});
