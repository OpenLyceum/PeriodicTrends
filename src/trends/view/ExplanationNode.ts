/**
 * ExplanationNode.ts
 *
 * The "Why?" panel: the selection's Z_eff-and-n story, its consequence for the chosen property,
 * and numbered notes for the anomalies (numbers match the badges on the graph). Rebuilt when the
 * selection, property, units or locale change; old text nodes are disposed.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { HBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";
import { AnomalyBadge } from "./AnomalyBadge.js";
import { describeSelection } from "./describeSelection.js";

export class ExplanationNode extends PeriodicTrendsPanel {
  public constructor(
    model: TrendsModel,
    electronVoltsProperty: TReadOnlyProperty<boolean>,
    contentWidth: number,
    maxContentHeight: number,
  ) {
    const strings = StringManager.getInstance().getTrendsStrings();
    const heading = new Text(strings.explanationTitleStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.heading, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: contentWidth,
    });
    const body = new VBox({ align: "left", spacing: 8 });
    const content = new VBox({
      align: "left",
      spacing: 8,
      children: [heading, body],
      // Keeps the panel a fixed width whatever the text.
      preferredWidth: contentWidth,
      maxHeight: maxContentHeight,
    });
    super(content);

    const font = new PhetFont(FONT_SIZE.small + 1);
    const paragraph = (markup: string, width: number) =>
      new RichText(markup, {
        font,
        fill: PeriodicTrendsColors.textColorProperty,
        lineWrap: width,
        leading: 2,
      });

    Multilink.multilink(
      [model.selectionProperty, model.periodicPropertyProperty, electronVoltsProperty, localeProperty],
      (selection, property, electronVolts) => {
        for (const child of body.children) {
          child.dispose();
        }
        const description = describeSelection(selection, property, electronVolts);
        const title = new RichText(description.title, {
          font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
          fill: PeriodicTrendsColors.selectionColorProperty,
          maxWidth: contentWidth,
        });
        const notes: Node[] = description.anomalyTexts.map((text, i) => {
          const badge = new AnomalyBadge(i + 1);
          return new HBox({
            align: "top",
            spacing: 6,
            children: [badge, paragraph(text, contentWidth - badge.width - 6)],
          });
        });
        body.children = [title, ...description.paragraphs.map((markup) => paragraph(markup, contentWidth)), ...notes];
      },
    );
  }
}
