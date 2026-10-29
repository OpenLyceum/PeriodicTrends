/**
 * TrendsScreenSummaryContent.ts
 *
 * Screen summary for the Trends screen. The current-details paragraph is live: it names the
 * selection, how the chosen property changes along it, and how Z_eff changes.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { TrendsModel } from "../model/TrendsModel.js";
import { speakSelection } from "./describeSelection.js";

export class TrendsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: TrendsModel, electronVoltsProperty: TReadOnlyProperty<boolean>) {
    const a11y = StringManager.getInstance().getTrendsA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [model.selectionProperty, model.periodicPropertyProperty, electronVoltsProperty, localeProperty],
      (selection, property, electronVolts) => speakSelection(selection, property, electronVolts),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
