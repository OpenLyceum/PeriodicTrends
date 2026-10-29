/**
 * shieldingColors.ts
 *
 * Colour of an electron on the Shielding screen by how it shields the chosen electron.
 */

import type { ProfileColorProperty } from "scenerystack/scenery";
import type { ShieldingKind } from "../../common/model/Slater.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";

export function colorForKind(kind: ShieldingKind): ProfileColorProperty {
  switch (kind) {
    case "sameGroup":
      return PeriodicTrendsColors.shieldSameGroupColorProperty;
    case "nMinusOne":
      return PeriodicTrendsColors.shieldNMinusOneColorProperty;
    case "inner":
      return PeriodicTrendsColors.shieldInnerColorProperty;
    default:
      return PeriodicTrendsColors.shieldOuterColorProperty;
  }
}
