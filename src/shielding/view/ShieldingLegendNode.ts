import { SHIELDING_LEGEND_NODE_SETTINGS } from "../../PeriodicTrendsConstants.js";
/**
 * ShieldingLegendNode.ts
 *
 * Key to the electron colours in the atom: the chosen electron, then each Slater weight.
 */

import { Circle, HBox, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import { colorForKind } from "./shieldingColors.js";

export class ShieldingLegendNode extends PeriodicTrendsPanel {
  public constructor(contentWidth: number) {
    const legend = StringManager.getInstance().getShieldingStrings().legend;
    const font = new PhetFont(FONT_SIZE.small);
    const row = (
      fill: Circle["fill"],
      text: typeof legend.targetStringProperty,
      radius: number = SHIELDING_LEGEND_NODE_SETTINGS.DEFAULT_RADIUS,
    ) =>
      new HBox({
        spacing: SHIELDING_LEGEND_NODE_SETTINGS.ROW_SPACING,
        children: [
          new Circle(radius, { fill }),
          new Text(text, {
            font,
            fill: PeriodicTrendsColors.textColorProperty,
            maxWidth: contentWidth - SHIELDING_LEGEND_NODE_SETTINGS.ROW_MAX_WIDTH_OFFSET,
          }),
        ],
      });
    super(
      new VBox({
        align: "left",
        spacing: SHIELDING_LEGEND_NODE_SETTINGS.CONSTRUCTOR_SPACING,
        children: [
          row(
            PeriodicTrendsColors.targetElectronColorProperty,
            legend.targetStringProperty,
            SHIELDING_LEGEND_NODE_SETTINGS.TARGET_ELECTRON_COLOR_ROW_RADIUS,
          ),
          row(colorForKind("sameGroup"), legend.sameGroupStringProperty),
          row(colorForKind("nMinusOne"), legend.nMinusOneStringProperty),
          row(colorForKind("inner"), legend.innerStringProperty),
          row(colorForKind("outer"), legend.outerStringProperty),
        ],
      }),
      // Same width as the "Electron to look at" panel above it.
      { minWidth: contentWidth + SHIELDING_LEGEND_NODE_SETTINGS.CONSTRUCTOR_MIN_WIDTH_OFFSET },
    );
  }
}
