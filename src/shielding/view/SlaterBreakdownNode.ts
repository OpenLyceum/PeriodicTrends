/**
 * SlaterBreakdownNode.ts
 *
 * Slater's rules worked out for the chosen electron, one row per occupied group:
 * electrons × shielding each = shielding, then the total S and Z_eff = Z − S. Each row's swatch
 * matches the electron colours in the atom.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, GridBox, HBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { groupLabel, type ShieldingResult } from "../../common/model/Slater.js";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { formatCharge } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import { colorForKind } from "./shieldingColors.js";

export class SlaterBreakdownNode extends PeriodicTrendsPanel {
  public constructor(shieldingProperty: TReadOnlyProperty<ShieldingResult>, contentWidth: number) {
    const strings = StringManager.getInstance().getShieldingStrings();
    const title = new Text(strings.breakdownTitleStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.heading, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: contentWidth,
    });
    const body = new VBox({ align: "left", spacing: 8 });
    super(new VBox({ align: "left", spacing: 8, children: [title, body] }), { minWidth: contentWidth + 24 });

    const font = new PhetFont(FONT_SIZE.small + 1);
    const boldFont = new PhetFont({ size: FONT_SIZE.small + 1, weight: "bold" });
    const cellText = (
      text: string | TReadOnlyProperty<string>,
      bold = false,
      fill = PeriodicTrendsColors.textColorProperty,
    ) => new Text(text, { font: bold ? boldFont : font, fill, maxWidth: contentWidth / 3 });

    Multilink.multilink([shieldingProperty, localeProperty], (result) => {
      for (const child of body.children) {
        child.dispose();
      }
      const rows: (Node | null)[][] = [
        [
          cellText(strings.columnGroupStringProperty.value, true),
          cellText(strings.columnElectronsStringProperty.value, true),
          cellText(strings.columnEachStringProperty.value, true),
          cellText(strings.columnShieldingStringProperty.value, true),
        ],
      ];
      for (const contribution of result.contributions) {
        if (contribution.count === 0) {
          continue;
        }
        const muted = contribution.kind === "outer";
        const fill = muted ? PeriodicTrendsColors.mutedTextColorProperty : PeriodicTrendsColors.textColorProperty;
        rows.push([
          new HBox({
            spacing: 5,
            children: [
              new Circle(5, { fill: colorForKind(contribution.kind) }),
              cellText(groupLabel(contribution.group), false, fill),
            ],
          }),
          cellText(String(contribution.count), false, fill),
          cellText(`× ${toFixed(contribution.perElectron, 2)}`, false, fill),
          cellText(`= ${toFixed(contribution.total, 2)}`, false, fill),
        ]);
      }
      rows.push([
        cellText(strings.totalSStringProperty.value, true),
        null,
        null,
        cellText(formatCharge(result.s), true),
      ]);
      // Four independently sized columns can exceed the allocated middle column in translation.
      // Scale the complete grid uniformly so headings and values stay aligned within the panel.
      const table = new GridBox({ xSpacing: 14, ySpacing: 4, xAlign: "left", rows, maxWidth: contentWidth });
      const equation = new RichText(
        StringUtils.fillIn(strings.zEffEquationStringProperty.value, {
          z: result.z,
          s: formatCharge(result.s),
          zEff: formatCharge(result.zEff),
        }),
        {
          font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
          fill: PeriodicTrendsColors.zEffColorProperty,
          maxWidth: contentWidth,
        },
      );
      const children: Node[] = [table, equation];
      if (result.target === "3d") {
        children.push(
          new RichText(strings.dShieldsNoteStringProperty.value, {
            font,
            fill: PeriodicTrendsColors.mutedTextColorProperty,
            lineWrap: contentWidth,
          }),
        );
      }
      body.children = children;
    });
  }
}
