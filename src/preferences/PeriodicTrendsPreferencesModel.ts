/**
 * PeriodicTrendsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in periodicTrendsQueryParameters.
 * */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import PeriodicTrendsNamespace from "../PeriodicTrendsNamespace.js";
import periodicTrendsQueryParameters from "./periodicTrendsQueryParameters.js";

export class PeriodicTrendsPreferencesModel {
  /** Show energies in eV instead of kJ/mol; initial value from the `electronVolts` query parameter. */
  public readonly electronVoltsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.electronVoltsProperty = new BooleanProperty(
      periodicTrendsQueryParameters.electronVolts,
      tandem ? { tandem: tandem.createTandem("electronVoltsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.electronVoltsProperty.reset();
  }
}

PeriodicTrendsNamespace.register("PeriodicTrendsPreferencesModel", PeriodicTrendsPreferencesModel);
