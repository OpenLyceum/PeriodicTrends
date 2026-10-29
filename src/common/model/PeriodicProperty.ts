/**
 * PeriodicProperty.ts
 *
 * The quantities the sim maps across the table: the four periodic properties plus Z_eff itself.
 * Values are returned in base units (pm, eV, or dimensionless); the view converts eV to kJ/mol.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { ELEMENTS, type ElementData, UNBOUND } from "./ElementData.js";
import { shielding } from "./Slater.js";

/** A value to plot or colour: a number, UNBOUND (electron affinity only), or null (undefined). */
export type PropertyValue = number | typeof UNBOUND | null;

/** Z_eff of each element's outermost electron, indexed by Z − 1. */
const VALENCE_Z_EFF: readonly number[] = ELEMENTS.map((element) => shielding(element.z, element.configuration).zEff);

/** Z_eff felt by the outermost electron of `element` (Slater's rules). */
export function valenceZEff(element: ElementData): number {
  return VALENCE_Z_EFF[element.z - 1] ?? 0;
}

export type PeriodicPropertyKey =
  | "atomicRadius"
  | "ionizationEnergy"
  | "electronAffinity"
  | "electronegativity"
  | "zEff";

export class PeriodicProperty extends EnumerationValue {
  public static readonly ATOMIC_RADIUS = new PeriodicProperty("atomicRadius", false, (e) => e.radius);
  public static readonly IONIZATION_ENERGY = new PeriodicProperty("ionizationEnergy", true, (e) => e.ionizationEnergy);
  public static readonly ELECTRON_AFFINITY = new PeriodicProperty("electronAffinity", true, (e) => e.electronAffinity);
  public static readonly ELECTRONEGATIVITY = new PeriodicProperty(
    "electronegativity",
    false,
    (e) => e.electronegativity,
  );
  public static readonly Z_EFF = new PeriodicProperty("zEff", false, valenceZEff);

  public static readonly enumeration = new Enumeration(PeriodicProperty);

  /**
   * @param key - string key, matching the strings file
   * @param isEnergy - true when the stored value is in eV (shown in kJ/mol or eV)
   * @param accessor - value in base units
   */
  public readonly key: PeriodicPropertyKey;
  public readonly isEnergy: boolean;
  private readonly accessor: (element: ElementData) => PropertyValue;

  public constructor(key: PeriodicPropertyKey, isEnergy: boolean, accessor: (element: ElementData) => PropertyValue) {
    super();
    this.key = key;
    this.isEnergy = isEnergy;
    this.accessor = accessor;
  }

  public getValue(element: ElementData): PropertyValue {
    return this.accessor(element);
  }

  /** The value as a number for colouring and plotting: UNBOUND counts as 0, undefined as null. */
  public getNumericValue(element: ElementData): number | null {
    const value = this.accessor(element);
    return value === UNBOUND ? 0 : value;
  }

  /** Smallest and largest numeric value over Z = 1–36, for a fixed colour scale and chart axis. */
  public getRange(): { min: number; max: number } {
    const values = ELEMENTS.map((element) => this.getNumericValue(element)).filter(
      (value): value is number => value !== null,
    );
    return { min: Math.min(...values), max: Math.max(...values) };
  }
}
