/**
 * HeatLegendNode.ts
 *
 * Colour key for the table: a gradient bar from the property's lowest to highest value (H to Kr),
 * with the two values below it.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { LinearGradient, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { formatNumber, toDisplayUnits, unitOf } from "../../common/view/formatValues.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";

const BAR_HEIGHT = 10;

export class HeatLegendNode extends Node {
  public constructor(model: TrendsModel, electronVoltsProperty: TReadOnlyProperty<boolean>, width: number) {
    super();
    const bar = new Rectangle(0, 0, width, BAR_HEIGHT, { stroke: PeriodicTrendsColors.cellStrokeColorProperty });
    const font = new PhetFont(FONT_SIZE.tiny);
    const low = new Text("", { font, fill: PeriodicTrendsColors.mutedTextColorProperty, maxWidth: width / 2 });
    const high = new Text("", { font, fill: PeriodicTrendsColors.mutedTextColorProperty, maxWidth: width / 2 });
    this.children = [bar, low, high];

    Multilink.multilink(
      [
        model.periodicPropertyProperty,
        electronVoltsProperty,
        localeProperty,
        PeriodicTrendsColors.heatLowColorProperty,
        PeriodicTrendsColors.heatHighColorProperty,
      ],
      (property, electronVolts, _locale, lowColor, highColor) => {
        bar.fill = new LinearGradient(0, 0, width, 0).addColorStop(0, lowColor).addColorStop(1, highColor);
        const range = property.getRange();
        const unit = unitOf(property, electronVolts);
        const format = (v: number) => {
          const text = formatNumber(property, toDisplayUnits(property, v, electronVolts), electronVolts);
          return unit ? `${text} ${unit}` : text;
        };
        low.string = format(range.min);
        high.string = format(range.max);
        low.left = 0;
        low.top = BAR_HEIGHT + 2;
        high.right = width;
        high.top = BAR_HEIGHT + 2;
      },
    );
  }
}
