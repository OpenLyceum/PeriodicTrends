/**
 * PeriodicTrendsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in periodicTrendsQueryParameters.
 * */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import { TableExtent } from "../common/model/TableExtent.js";
import PeriodicTrendsNamespace from "../PeriodicTrendsNamespace.js";
import periodicTrendsQueryParameters from "./periodicTrendsQueryParameters.js";

export class PeriodicTrendsPreferencesModel {
  /** Show energies in eV instead of kJ/mol; initial value from the `electronVolts` query parameter. */
  public readonly electronVoltsProperty: BooleanProperty;

  /** How much of the periodic table is shown; initial value from the `maxZ` query parameter. */
  public readonly tableExtentProperty: EnumerationProperty<TableExtent>;

  public constructor(tandem?: Tandem) {
    this.electronVoltsProperty = new BooleanProperty(
      periodicTrendsQueryParameters.electronVolts,
      tandem ? { tandem: tandem.createTandem("electronVoltsProperty") } : undefined,
    );
    this.tableExtentProperty = new EnumerationProperty(
      TableExtent.enumeration.values.find((extent) => extent.maxZ === periodicTrendsQueryParameters.maxZ) ??
        TableExtent.KRYPTON,
      tandem ? { tandem: tandem.createTandem("tableExtentProperty") } : undefined,
    );
  }

  public reset(): void {
    this.electronVoltsProperty.reset();
    this.tableExtentProperty.reset();
  }
}

PeriodicTrendsNamespace.register("PeriodicTrendsPreferencesModel", PeriodicTrendsPreferencesModel);
