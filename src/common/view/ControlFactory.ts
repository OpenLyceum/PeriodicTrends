import { CONTROL_FACTORY_SETTINGS } from "../../PeriodicTrendsConstants.js";
/**
 * ControlFactory.ts
 *
 * Themed builders for panel controls (copied from LightAndAtoms ← SpectroscopyLab ← MolScope). `accessibleName` is a required
 * argument, so a control without one is a compile error rather than a silent gap.
 */

import type { PhetioProperty, Property, TReadOnlyProperty } from "scenerystack/axon";
import { RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Checkbox, TextPushButton } from "scenerystack/sun";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../PeriodicTrendsButtonOptions.js";
import { PERIODIC_TRENDS_CHECKBOX_OPTIONS } from "../PeriodicTrendsControlOptions.js";

const CONTROL_FONT = new PhetFont(CONTROL_FACTORY_SETTINGS.CONTROL_FONT_SIZE);
const HEADING_FONT = new PhetFont({ size: CONTROL_FACTORY_SETTINGS.HEADING_FONT_SIZE, weight: "bold" });

export function heading(text: TReadOnlyProperty<string>, maxWidth: number): Text {
  return new Text(text, { font: HEADING_FONT, fill: PeriodicTrendsColors.textColorProperty, maxWidth });
}

/** A panel label; RichText so labels can carry markup such as Z<sub>eff</sub>. */
export function label(text: TReadOnlyProperty<string> | string, maxWidth: number): RichText {
  return new RichText(text, { font: CONTROL_FONT, fill: PeriodicTrendsColors.textColorProperty, maxWidth });
}

export type ComboChoice<T> = { readonly value: T; readonly label: TReadOnlyProperty<string> };

export function checkbox(
  property: Property<boolean>,
  text: TReadOnlyProperty<string>,
  maxWidth: number,
  accessibleName = text,
): Checkbox {
  return new Checkbox(property, label(text, maxWidth), {
    ...PERIODIC_TRENDS_CHECKBOX_OPTIONS,
    accessibleName,
  });
}

export function pushButton(
  text: TReadOnlyProperty<string>,
  listener: () => void,
  accessibleName = text,
): TextPushButton {
  return new TextPushButton(text, {
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    font: CONTROL_FONT,
    textFill: LIGHT_SURFACE_TEXT_FILL,
    xMargin: CONTROL_FACTORY_SETTINGS.PUSH_BUTTON_X_MARGIN,
    yMargin: CONTROL_FACTORY_SETTINGS.PUSH_BUTTON_Y_MARGIN,
    maxTextWidth: 180,
    listener,
    accessibleName,
  });
}

export function radioGroup<T>(
  property: PhetioProperty<T>,
  choices: readonly ComboChoice<T>[],
  accessibleName: TReadOnlyProperty<string>,
  maxWidth: number,
  orientation: "vertical" | "horizontal" = "vertical",
): AquaRadioButtonGroup<T> {
  return new AquaRadioButtonGroup(
    property,
    choices.map((choice) => ({
      value: choice.value,
      createNode: () => label(choice.label, maxWidth),
      options: { accessibleName: choice.label },
    })),
    {
      orientation,
      spacing: orientation === "vertical" ? CONTROL_FACTORY_SETTINGS.RADIO_GROUP_SPACING : 10,
      radioButtonOptions: {
        radius: CONTROL_FACTORY_SETTINGS.RADIO_GROUP_RADIUS,
        selectedColor: PeriodicTrendsColors.accentColorProperty,
      },
      accessibleName,
    },
  );
}
