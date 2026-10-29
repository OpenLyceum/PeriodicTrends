/**
 * PeriodicTrendsHotkeyData.ts
 *
 * Keys of the Trends periodic table and the Shielding element picker. The KeyboardListeners use
 * these keys, and the keyboard-help dialogs label them with the sim's own wording.
 */

import { HotkeyData } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";

const REPO_NAME = "periodic-trends";
const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();

const PeriodicTrendsHotkeyData = {
  MOVE_FOCUS: new HotkeyData({
    keys: ["arrowLeft", "arrowRight", "arrowUp", "arrowDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.moveFocusStringProperty,
  }),
  SELECT_ELEMENT: new HotkeyData({
    keys: ["enter", "space"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.selectElementStringProperty,
  }),
  EXTEND_SELECTION: new HotkeyData({
    keys: ["shift+arrowLeft", "shift+arrowRight", "shift+arrowUp", "shift+arrowDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.extendSelectionStringProperty,
  }),
  SELECT_PERIOD: new HotkeyData({
    keys: ["p"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.selectPeriodStringProperty,
  }),
  SELECT_GROUP: new HotkeyData({
    keys: ["g"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.selectGroupStringProperty,
  }),
  CHOOSE_ELEMENT: new HotkeyData({
    keys: ["arrowLeft", "arrowRight", "arrowUp", "arrowDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.chooseElementStringProperty,
  }),
};

export default PeriodicTrendsHotkeyData;
