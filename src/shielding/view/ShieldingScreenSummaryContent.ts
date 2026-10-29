/**
 * ShieldingScreenSummaryContent.ts
 *
 * Screen summary for the Shielding screen. The current-details paragraph is live: it reads out
 * Slater's rules for the chosen electron, group by group, and the resulting Z_eff.
 */

import { DerivedProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { groupLabel } from "../../common/model/Slater.js";
import { elementName, formatCharge } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ShieldingModel } from "../model/ShieldingModel.js";

/** "(3s, 3p)" → "3s, 3p" for speech. */
function spokenGroup(label: string): string {
  return label.replace(/[()]/g, "");
}

export class ShieldingScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ShieldingModel) {
    const a11y = StringManager.getInstance().getShieldingA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [model.elementProperty, model.shieldingProperty, localeProperty],
      (element, result) => {
        const breakdown = result.contributions
          .filter((contribution) => contribution.count > 0 && contribution.kind !== "outer")
          .map((contribution) =>
            StringUtils.fillIn(a11y.breakdownItemStringProperty.value, {
              count: contribution.count,
              group: spokenGroup(groupLabel(contribution.group)),
              weight: toFixed(contribution.perElectron, 2),
            }),
          )
          .join(" ");
        return StringUtils.fillIn(a11y.currentDetailsStringProperty.value, {
          name: elementName(element),
          group: spokenGroup(groupLabel(result.target)),
          breakdown,
          s: formatCharge(result.s),
          z: element.z,
          zEff: formatCharge(result.zEff),
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
