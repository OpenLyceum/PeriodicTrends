/**
 * ShieldingKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Shielding screen: the element picker on the left; radio buttons
 * and push buttons on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import PeriodicTrendsHotkeyData from "../../common/PeriodicTrendsHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class ShieldingKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const pickerSection = new KeyboardHelpSection(keyboardHelp.pickerSectionStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.CHOOSE_ELEMENT),
    ]);
    super([pickerSection], [new BasicActionsKeyboardHelpSection()]);
  }
}
