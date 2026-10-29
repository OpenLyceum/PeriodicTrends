/**
 * TrendsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createTrendsIcon() in src/common/PeriodicTrendsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import type { SelectedElementModel } from "../common/model/SelectedElementModel.js";
import { createTrendsIcon } from "../common/PeriodicTrendsScreenIcons.js";
import PeriodicTrendsColors from "../PeriodicTrendsColors.js";
import { TrendsModel } from "./model/TrendsModel.js";
import { TrendsKeyboardHelpContent } from "./view/TrendsKeyboardHelpContent.js";
import { TrendsScreenView } from "./view/TrendsScreenView.js";

type SelfOptions = {
  /** The element shared by both screens. */
  selectedElement: SelectedElementModel;
  /** Energies in eV instead of kJ/mol (Preferences). */
  electronVoltsProperty: TReadOnlyProperty<boolean>;
  /** Switches to the Shielding screen. */
  showShielding: () => void;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type TrendsScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class TrendsScreen extends Screen<TrendsModel, TrendsScreenView> {
  public constructor(options: TrendsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new TrendsModel(options.selectedElement),
      // View factory — receives the model instance
      (model) =>
        new TrendsScreenView(model, {
          electronVoltsProperty: options.electronVoltsProperty,
          showShielding: options.showShielding,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<TrendsScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PeriodicTrendsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new TrendsKeyboardHelpContent(),
          homeScreenIcon: createTrendsIcon(),
          navigationBarIcon: createTrendsIcon(),
        },
        options,
      ),
    );
  }
}
