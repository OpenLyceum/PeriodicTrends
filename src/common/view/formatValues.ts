/**
 * formatValues.ts
 *
 * Display values and readouts for the periodic properties. Energies are stored in eV and shown in
 * kJ/mol unless the eV preference is on. Readouts are plain text (no markup) so they also serve
 * screen-reader descriptions.
 */

import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { type ElementData, UNBOUND } from "../../common/model/ElementData.js";
import type { PeriodicProperty } from "../../common/model/PeriodicProperty.js";
import { StringManager } from "../../i18n/StringManager.js";
import { KJ_PER_MOL_PER_EV } from "../../PeriodicTrendsConstants.js";

const MINUS = "−";

/** Number of decimals shown for a property. */
function decimalsOf(property: PeriodicProperty, electronVolts: boolean): number {
  switch (property.key) {
    case "atomicRadius":
      return 0;
    case "ionizationEnergy":
    case "electronAffinity":
      return electronVolts ? 2 : 0;
    default:
      return 2;
  }
}

/** Converts a value in base units to display units (eV → kJ/mol unless `electronVolts`). */
export function toDisplayUnits(property: PeriodicProperty, value: number, electronVolts: boolean): number {
  return property.isEnergy && !electronVolts ? value * KJ_PER_MOL_PER_EV : value;
}

/** Numeric display value for plotting: UNBOUND as 0, undefined as null. */
export function displayValue(property: PeriodicProperty, element: ElementData, electronVolts: boolean): number | null {
  const value = property.getNumericValue(element);
  return value === null ? null : toDisplayUnits(property, value, electronVolts);
}

/** A number in display units, rounded for the property. */
export function formatNumber(property: PeriodicProperty, value: number, electronVolts: boolean): string {
  return toFixed(value, decimalsOf(property, electronVolts)).replace("-", MINUS);
}

/** Unit label for a property ("" for dimensionless ones). */
export function unitOf(property: PeriodicProperty, electronVolts: boolean): string {
  const units = StringManager.getInstance().getCommonStrings().units;
  if (property.key === "atomicRadius") {
    return units.pmStringProperty.value;
  }
  if (property.isEnergy) {
    return electronVolts ? units.eVStringProperty.value : units.kjPerMolStringProperty.value;
  }
  return "";
}

/** Short cell text: the number alone, "< 0" for an unbound anion, "—" for undefined. */
export function cellText(property: PeriodicProperty, element: ElementData, electronVolts: boolean): string {
  const common = StringManager.getInstance().getCommonStrings();
  const value = property.getValue(element);
  if (value === null) {
    return common.noDataStringProperty.value;
  }
  if (value === UNBOUND) {
    return common.unboundStringProperty.value;
  }
  return formatNumber(property, toDisplayUnits(property, value, electronVolts), electronVolts);
}

/** Full readout with unit, e.g. "1251 kJ/mol", "< 0 (no stable anion)", "—". */
export function readout(property: PeriodicProperty, element: ElementData, electronVolts: boolean): string {
  const common = StringManager.getInstance().getCommonStrings();
  const value = property.getValue(element);
  if (value === null) {
    return common.noDataStringProperty.value;
  }
  if (value === UNBOUND) {
    return common.unboundLongStringProperty.value;
  }
  const number = formatNumber(property, toDisplayUnits(property, value, electronVolts), electronVolts);
  const unit = unitOf(property, electronVolts);
  return unit ? StringUtils.fillIn(common.valueWithUnitStringProperty.value, { value: number, unit }) : number;
}

/** Z_eff (or S) with two decimals. */
export function formatCharge(value: number): string {
  return toFixed(value, 2);
}

/** Localised element name. */
export function elementName(element: ElementData): string {
  return StringManager.getInstance().getElementNames()[element.symbol]?.value ?? element.symbol;
}

/** Localised name of a property, plain text. */
export function propertyName(property: PeriodicProperty): string {
  const names = StringManager.getInstance().getCommonStrings().properties;
  return {
    atomicRadius: names.atomicRadiusStringProperty,
    ionizationEnergy: names.ionizationEnergyStringProperty,
    electronAffinity: names.electronAffinityStringProperty,
    electronegativity: names.electronegativityStringProperty,
    zEff: names.zEffStringProperty,
  }[property.key].value;
}
