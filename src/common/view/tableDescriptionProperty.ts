import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { getElement } from "../model/ElementData.js";
import type { TableExtent } from "../model/TableExtent.js";
import { elementName } from "./formatValues.js";

/** Localized accessible range of a table. The owning table/summary lives for the whole screen. */
export function tableDescriptionProperty(
  extentProperty: TReadOnlyProperty<TableExtent>,
  patternProperty: TReadOnlyProperty<string>,
): TReadOnlyProperty<string> {
  return new DerivedProperty([extentProperty, patternProperty, localeProperty], (table, pattern) =>
    StringUtils.fillIn(pattern, { last: elementName(getElement(table.maxZ)) }),
  );
}
