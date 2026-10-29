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
    const row = (fill: Circle["fill"], text: typeof legend.targetStringProperty, radius = 5) =>
      new HBox({
        spacing: 6,
        children: [
          new Circle(radius, { fill }),
          new Text(text, { font, fill: PeriodicTrendsColors.textColorProperty, maxWidth: contentWidth - 20 }),
        ],
      });
    super(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          row(PeriodicTrendsColors.targetElectronColorProperty, legend.targetStringProperty, 7),
          row(colorForKind("sameGroup"), legend.sameGroupStringProperty),
          row(colorForKind("nMinusOne"), legend.nMinusOneStringProperty),
          row(colorForKind("inner"), legend.innerStringProperty),
          row(colorForKind("outer"), legend.outerStringProperty),
        ],
      }),
      // Same width as the "Electron to look at" panel above it.
      { minWidth: contentWidth + 24 },
    );
  }
}
