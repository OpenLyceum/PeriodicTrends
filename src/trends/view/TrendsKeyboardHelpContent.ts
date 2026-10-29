/**
 * TrendsKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Trends screen: the periodic-table keys on the left; radio buttons,
 * checkbox and buttons on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import PeriodicTrendsHotkeyData from "../../common/PeriodicTrendsHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class TrendsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const tableSection = new KeyboardHelpSection(keyboardHelp.tableSectionStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.MOVE_FOCUS),
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.SELECT_ELEMENT),
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.EXTEND_SELECTION),
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.SELECT_PERIOD),
      KeyboardHelpSectionRow.fromHotkeyData(PeriodicTrendsHotkeyData.SELECT_GROUP),
    ]);
    super([tableSection], [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })]);
  }
}
