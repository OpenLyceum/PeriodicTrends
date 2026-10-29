/**
 * PeriodicTrendsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to PeriodicTrendsPreferencesModel Properties (whose initial values come from
 * periodicTrendsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import PeriodicTrendsColors from "../PeriodicTrendsColors.js";
import PeriodicTrendsNamespace from "../PeriodicTrendsNamespace.js";
import type { PeriodicTrendsPreferencesModel } from "./PeriodicTrendsPreferencesModel.js";

export class PeriodicTrendsPreferencesNode extends VBox {
  public constructor(preferencesModel: PeriodicTrendsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: PeriodicTrendsColors.controlSurfaceTextColorProperty,
    });

    const electronVoltsCheckbox = new Checkbox(
      preferencesModel.electronVoltsProperty,
      new Text(prefStrings.electronVoltsStringProperty, {
        font: new PhetFont(14),
        fill: PeriodicTrendsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: PeriodicTrendsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: PeriodicTrendsColors.controlSurfaceColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("electronVoltsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, electronVoltsCheckbox],
    });
  }
}

PeriodicTrendsNamespace.register("PeriodicTrendsPreferencesNode", PeriodicTrendsPreferencesNode);
