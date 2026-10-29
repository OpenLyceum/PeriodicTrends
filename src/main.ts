/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { SelectedElementModel } from "./common/model/SelectedElementModel.js";
import { StringManager } from "./i18n/StringManager.js";
import PeriodicTrendsColors from "./PeriodicTrendsColors.js";
import { PeriodicTrendsPreferencesModel } from "./preferences/PeriodicTrendsPreferencesModel.js";
import { PeriodicTrendsPreferencesNode } from "./preferences/PeriodicTrendsPreferencesNode.js";
import { ShieldingScreen } from "./shielding/ShieldingScreen.js";
import { TrendsScreen } from "./trends/TrendsScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from periodicTrendsQueryParameters.
  const simPreferences = new PeriodicTrendsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  // One element shared by both screens: what Trends selects, Shielding explains.
  const selectedElement = new SelectedElementModel();

  const shieldingScreen = new ShieldingScreen({
    selectedElement,
    name: stringManager.getScreenNames().shieldingStringProperty,
    tandem: Tandem.ROOT.createTandem("shieldingScreen"),
    backgroundColorProperty: PeriodicTrendsColors.backgroundColorProperty,
  });

  // Assigned below; the Trends "Explain with shielding" button needs the Sim to switch screens.
  let sim: Sim | null = null;

  const screens = [
    new TrendsScreen({
      selectedElement,
      electronVoltsProperty: simPreferences.electronVoltsProperty,
      showShielding: () => {
        if (sim) {
          sim.selectedScreenProperty.value = shieldingScreen;
        }
      },
      name: stringManager.getScreenNames().trendsStringProperty,
      tandem: Tandem.ROOT.createTandem("trendsScreen"),
      backgroundColorProperty: PeriodicTrendsColors.backgroundColorProperty,
    }),
    shieldingScreen,
  ];

  sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new PeriodicTrendsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    credits: {
      leadDesign: "Martin Veillette",
      softwareDevelopment: "Martin Veillette",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
