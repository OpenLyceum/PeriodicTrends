/**
 * heatColor.ts
 *
 * The table's sequential heat map: a value's position in its property's range, blended between
 * the low and high heat colours, plus a dark-or-light text colour that stays readable on it.
 */

import { Color, type ProfileColorProperty } from "scenerystack/scenery";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";

/** Relative luminance (WCAG) of a colour. */
function luminance(color: Color): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

/** Fill for fraction t ∈ [0, 1] of the range, or the no-data colour for null. */
export function heatFill(t: number | null): Color {
  if (t === null) {
    return PeriodicTrendsColors.noDataCellColorProperty.value;
  }
  const clamped = Math.min(1, Math.max(0, t));
  return Color.interpolateRGBA(
    PeriodicTrendsColors.heatLowColorProperty.value,
    PeriodicTrendsColors.heatHighColorProperty.value,
    clamped,
  );
}

/** Dark text on light fills, light text on dark fills. */
export function textColorFor(fill: Color): ProfileColorProperty {
  return luminance(fill) > 0.3
    ? PeriodicTrendsColors.cellTextDarkColorProperty
    : PeriodicTrendsColors.cellTextLightColorProperty;
}

/** Profile colours the heat map reads, so owners can re-colour when the profile changes. */
export const HEAT_COLOR_PROPERTIES = [
  PeriodicTrendsColors.heatLowColorProperty,
  PeriodicTrendsColors.heatHighColorProperty,
  PeriodicTrendsColors.noDataCellColorProperty,
] as const;
