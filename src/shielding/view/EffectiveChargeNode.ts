/**
 * EffectiveChargeNode.ts
 *
 * "What this electron feels": the full nuclear charge +Z and the effective charge +Z_eff as two
 * bars on one scale (0 to 36), with the shielded percentage. Stepping across a period shows the
 * felt bar growing; stepping down a group shows it barely changing while n grows.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { MAX_Z } from "../../common/model/ElementData.js";
import type { ShieldingResult } from "../../common/model/Slater.js";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { formatCharge } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";

const BAR_HEIGHT = 12;

export class EffectiveChargeNode extends PeriodicTrendsPanel {
  public constructor(shieldingProperty: TReadOnlyProperty<ShieldingResult>, contentWidth: number) {
    const strings = StringManager.getInstance().getShieldingStrings();
    const font = new PhetFont(FONT_SIZE.small + 1);
    const title = new Text(strings.feelsTitleStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.heading, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: contentWidth,
    });
    const nucleusLabel = new Text("", { font, fill: PeriodicTrendsColors.textColorProperty, maxWidth: contentWidth });
    const nucleusBar = new Rectangle(0, 0, 1, BAR_HEIGHT, { fill: PeriodicTrendsColors.nucleusColorProperty });
    const feltLabel = new Text("", { font, fill: PeriodicTrendsColors.textColorProperty, maxWidth: contentWidth });
    const feltBar = new Rectangle(0, 0, 1, BAR_HEIGHT, { fill: PeriodicTrendsColors.zEffColorProperty });
    const percent = new RichText("", {
      font,
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      lineWrap: contentWidth,
    });
    super(
      new VBox({
        align: "left",
        spacing: 4,
        preferredWidth: contentWidth,
        children: [title, nucleusLabel, nucleusBar, feltLabel, feltBar, percent],
      }),
      { minWidth: contentWidth + 24 },
    );

    Multilink.multilink([shieldingProperty, localeProperty], (result) => {
      const scale = contentWidth / MAX_Z;
      nucleusBar.setRectWidth(Math.max(1, result.z * scale));
      feltBar.setRectWidth(Math.max(1, result.zEff * scale));
      nucleusLabel.string = StringUtils.fillIn(strings.nuclearChargeStringProperty.value, { z: result.z });
      feltLabel.string = StringUtils.fillIn(strings.effectiveChargeStringProperty.value, {
        zEff: formatCharge(result.zEff),
      });
      percent.string = StringUtils.fillIn(strings.shieldedPercentStringProperty.value, {
        percent: Math.round((100 * result.s) / result.z),
      });
    });
  }
}
