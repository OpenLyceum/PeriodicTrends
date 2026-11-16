import { PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS } from "../PeriodicTrendsConstants.js";
/**
 * PeriodicTrendsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to PeriodicTrendsPreferencesModel Properties (whose initial values come from
 * periodicTrendsQueryParameters).
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { TableExtent } from "../common/model/TableExtent.js";
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
      font: new PhetFont({ size: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: PeriodicTrendsColors.controlSurfaceTextColorProperty,
    });

    const electronVoltsCheckbox = new Checkbox(
      preferencesModel.electronVoltsProperty,
      new Text(prefStrings.electronVoltsStringProperty, {
        font: new PhetFont(PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.ELECTRON_VOLTS_CHECKBOX_FONT_SIZE),
        fill: PeriodicTrendsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: PeriodicTrendsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: PeriodicTrendsColors.controlSurfaceColorProperty,
        spacing: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.ELECTRON_VOLTS_CHECKBOX_SPACING,
        ...(tandem && { tandem: tandem.createTandem("electronVoltsCheckbox") }),
      },
    );

    const optionText = (text: TReadOnlyProperty<string>): Text =>
      new Text(text, {
        font: new PhetFont(PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.OPTION_TEXT_FONT_SIZE),
        fill: PeriodicTrendsColors.controlSurfaceTextColorProperty,
      });
    const extentRadio = new AquaRadioButtonGroup(
      preferencesModel.tableExtentProperty,
      [
        { value: TableExtent.KRYPTON, label: prefStrings.throughKryptonStringProperty },
        { value: TableExtent.XENON, label: prefStrings.throughXenonStringProperty },
        { value: TableExtent.RADON, label: prefStrings.throughRadonStringProperty },
      ].map(({ value, label }) => ({
        value,
        createNode: () => optionText(label),
        options: { accessibleName: label },
      })),
      {
        spacing: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.EXTENT_RADIO_SPACING,
        radioButtonOptions: {
          radius: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.EXTENT_RADIO_RADIUS,
          selectedColor: PeriodicTrendsColors.controlSurfaceTextColorProperty,
        },
        accessibleName: prefStrings.tableExtentStringProperty,
        ...(tandem && { tandem: tandem.createTandem("tableExtentRadioButtonGroup") }),
      },
    );

    super({
      align: "left",
      spacing: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [
        header,
        electronVoltsCheckbox,
        new VBox({
          align: "left",
          spacing: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.ITEM_3_SPACING,
          children: [
            optionText(prefStrings.tableExtentStringProperty),
            new Node({ children: [extentRadio], x: PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_X }),
          ],
        }),
      ],
    });
  }
}

PeriodicTrendsNamespace.register("PeriodicTrendsPreferencesNode", PeriodicTrendsPreferencesNode);
