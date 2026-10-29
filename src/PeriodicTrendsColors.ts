/**
 * PeriodicTrendsColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import PeriodicTrendsColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: PeriodicTrendsColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the PeriodicTrendsColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import PeriodicTrendsNamespace from "./PeriodicTrendsNamespace.js";

const PeriodicTrendsColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Sim-specific ─────────────────────────────────────────────────────────────

  /** Secondary text: axis labels, hints, legends. */
  mutedTextColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "mutedText", {
    default: "#a0a8c0",
    projector: "#555555",
  }),

  /** Low and high ends of the table's heat map (pale to saturated in both profiles). */
  heatLowColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "heatLow", {
    default: "#fff5d6",
    projector: "#fff5d6",
  }),
  heatHighColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "heatHigh", {
    default: "#c2410c",
    projector: "#b43a0a",
  }),

  /** Cell with no value for the mapped property (e.g. noble-gas electronegativity). */
  noDataCellColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "noDataCell", {
    default: "#4a4f63",
    projector: "#d0d0d0",
  }),

  /** Cell text, chosen per cell by the fill's lightness. */
  cellTextDarkColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "cellTextDark", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
  cellTextLightColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "cellTextLight", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Cell outline, and the outline of selected cells. */
  cellStrokeColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "cellStroke", {
    default: "#1a1a2e",
    projector: "#888888",
  }),
  selectionColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "selection", {
    default: "#4fc3f7",
    projector: "#0057b8",
  }),

  /** Keyboard cursor on the table. */
  focusCellColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "focusCell", {
    default: "#ffeb3b",
    projector: "#7b1fa2",
  }),

  /** Graph chrome. */
  chartBackgroundColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "chartBackground", {
    default: "#10182e",
    projector: "#ffffff",
  }),
  chartAxisColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "chartAxis", {
    default: "#8890a8",
    projector: "#555555",
  }),
  chartGridColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "chartGrid", {
    default: "#26304d",
    projector: "#e3e3e3",
  }),

  /** The mapped property's curve and points on the graph. */
  propertyCurveColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "propertyCurve", {
    default: "#ff9e57",
    projector: "#c2410c",
  }),

  /** Z_eff everywhere it appears: graph overlay, readouts, effective-charge disc. */
  zEffColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "zEff", {
    default: "#7ee08a",
    projector: "#1b7a2b",
  }),

  /** Numbered anomaly badges on the graph and in the explanation. */
  anomalyColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "anomaly", {
    default: "#ff6b8b",
    projector: "#c2185b",
  }),

  /** Shielding screen: nucleus, shells, and electrons by Slater weight. */
  nucleusColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "nucleus", {
    default: "#ef5350",
    projector: "#d32f2f",
  }),
  shellColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "shell", {
    default: "#5a6485",
    projector: "#9e9e9e",
  }),
  targetElectronColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "targetElectron", {
    default: "#ffeb3b",
    projector: "#f9a825",
  }),
  shieldSameGroupColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "shieldSameGroup", {
    default: "#80deea",
    projector: "#00838f",
  }),
  shieldNMinusOneColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "shieldNMinusOne", {
    default: "#64b5f6",
    projector: "#1565c0",
  }),
  shieldInnerColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "shieldInner", {
    default: "#b39ddb",
    projector: "#4527a0",
  }),
  shieldOuterColorProperty: new ProfileColorProperty(PeriodicTrendsNamespace, "shieldOuter", {
    default: "#6b7086",
    projector: "#bdbdbd",
  }),
};

export default PeriodicTrendsColors;
