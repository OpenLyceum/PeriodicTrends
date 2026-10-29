/**
 * ElementCardNode.ts
 *
 * A large card for the selection's anchor element, drawn in the empty d-block gap of periods 1–3:
 * symbol, name, Z / period / group, configuration, the chosen property and Z_eff.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { getElement, shortConfigurationText } from "../../common/model/ElementData.js";
import { valenceZEff } from "../../common/model/PeriodicProperty.js";
import { elementName, formatCharge, propertyName, readout } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";

export class ElementCardNode extends HBox {
  public constructor(model: TrendsModel, electronVoltsProperty: TReadOnlyProperty<boolean>, maxWidth: number) {
    const common = StringManager.getInstance().getCommonStrings();
    const symbol = new Text("", {
      font: new PhetFont({ size: 40, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
    });
    const textWidth = maxWidth - 70;
    const name = new Text("", {
      font: new PhetFont({ size: FONT_SIZE.heading, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: textWidth,
    });
    const details = new Text("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      maxWidth: textWidth,
    });
    const configuration = new Text("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      maxWidth: textWidth,
    });
    const value = new RichText("", {
      font: new PhetFont(FONT_SIZE.label),
      fill: PeriodicTrendsColors.propertyCurveColorProperty,
      maxWidth: textWidth,
    });
    const zEff = new RichText("", {
      font: new PhetFont(FONT_SIZE.label),
      fill: PeriodicTrendsColors.zEffColorProperty,
      maxWidth: textWidth,
    });
    super({
      spacing: 12,
      align: "center",
      children: [
        symbol,
        new VBox({ align: "left", spacing: 2, children: [name, details, configuration, value, zEff] }),
      ],
    });

    Multilink.multilink(
      [model.selectionProperty, model.periodicPropertyProperty, electronVoltsProperty, localeProperty],
      (selection, property, electronVolts) => {
        const element = getElement(selection.anchorZ);
        symbol.string = element.symbol;
        name.string = elementName(element);
        const detailsPattern =
          element.group === null ? common.elementDetailsLanthanideStringProperty : common.elementDetailsStringProperty;
        details.string = StringUtils.fillIn(detailsPattern.value, {
          z: element.z,
          period: element.period,
          group: element.group,
        });
        configuration.string = StringUtils.fillIn(common.configurationStringProperty.value, {
          configuration: shortConfigurationText(element),
        });
        value.string =
          property.key === "zEff" ? "" : `${propertyName(property)}: ${readout(property, element, electronVolts)}`;
        zEff.string = StringUtils.fillIn(common.zEffValueStringProperty.value, {
          value: formatCharge(valenceZEff(element)),
        });
      },
    );
  }
}
