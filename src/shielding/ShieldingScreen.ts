/**
 * ShieldingScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createShieldingIcon() in src/common/PeriodicTrendsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import type { SelectedElementModel } from "../common/model/SelectedElementModel.js";
import { createShieldingIcon } from "../common/PeriodicTrendsScreenIcons.js";
import PeriodicTrendsColors from "../PeriodicTrendsColors.js";
import { ShieldingModel } from "./model/ShieldingModel.js";
import { ShieldingKeyboardHelpContent } from "./view/ShieldingKeyboardHelpContent.js";
import { ShieldingScreenView } from "./view/ShieldingScreenView.js";

type SelfOptions = {
  /** The element shared by both screens. */
  selectedElement: SelectedElementModel;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ShieldingScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class ShieldingScreen extends Screen<ShieldingModel, ShieldingScreenView> {
  public constructor(options: ShieldingScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ShieldingModel(options.selectedElement),
      // View factory — receives the model instance
      (model) =>
        new ShieldingScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ShieldingScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PeriodicTrendsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ShieldingKeyboardHelpContent(),
          homeScreenIcon: createShieldingIcon(),
          navigationBarIcon: createShieldingIcon(),
        },
        options,
      ),
    );
  }
}
