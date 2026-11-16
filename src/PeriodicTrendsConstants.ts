/**
 * PeriodicTrendsConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Model values carry their unit in the name or a comment (pm, eV, kJ/mol).
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in PeriodicTrendsColors.ts, not here.
 */

import PeriodicTrendsNamespace from "./PeriodicTrendsNamespace.js";

// ── Model ─────────────────────────────────────────────────────────────────────

/** 1 eV per particle in kJ/mol (CODATA 2018: e × N_A / 1000). */
export const KJ_PER_MOL_PER_EV = 96.485_332_12;

/** Shielding's default when opened first: chlorine (Z_eff = 6.10). Trends initializes its own anchor. */
export const DEFAULT_ELEMENT_Z = 17;

/** Period selected on the Trends screen at startup. */
export const DEFAULT_PERIOD = 2;

/** Upper end of the Z_eff axis on the graph and the effective-charge bar. */
export const MAX_Z_EFF_AXIS = 9;

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Gap between neighbouring panels. */
export const PANEL_SPACING = 10;

/** Width of the right-hand column of panels on both screens. */
export const SIDE_COLUMN_WIDTH = 290;

/** Trends periodic-table cell size. */
export const CELL_WIDTH = 36;
export const CELL_HEIGHT = 40;

/** Shielding-screen element-picker cell size. */
export const MINI_CELL_WIDTH = 22;
export const MINI_CELL_HEIGHT = 22;

/** Font sizes. */
export const FONT_SIZE = {
  tiny: 9,
  small: 11,
  label: 13,
  heading: 15,
  title: 20,
} as const;

/** Settings for common/PeriodicTrendsControlOptions.ts. */
export const PERIODIC_TRENDS_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** NumberControl arrow-button scale (dimensionless). */
  NUMBER_CONTROL_SCALE: 0.75,
  /** NumberControl layout slider padding (px). */
  NUMBER_CONTROL_SLIDER_PADDING: 4,
  /** NumberControl layout arrow-button spacing (px). */
  NUMBER_CONTROL_ARROW_BUTTON_SPACING: 3,
  /** NumberControl layout vertical spacing (px). */
  NUMBER_CONTROL_VERTICAL_SPACING: 4,
  /** Checkbox label spacing (px). */
  CHECKBOX_SPACING: 4,
} as const;

/** Settings for common/PeriodicTrendsPanel.ts. */
export const PERIODIC_TRENDS_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/PeriodicTrendsScreenIcons.ts. */
export const PERIODIC_TRENDS_SCREEN_ICONS_SETTINGS = {
  CREATE_SHIELDING_ICON_SIZE: 20, // px

  /** Cells y (px). */
  CELLS_Y: 250,
  /** Cells height (px). */
  CELLS_HEIGHT: 80,
  /** Cells corner radius (px). */
  CELLS_CORNER_RADIUS: 6,
  /** Create trends icon line width (px). */
  CREATE_TRENDS_ICON_LINE_WIDTH: 8,
  /** Shell line width (px). */
  SHELL_LINE_WIDTH: 5,
  /** Default size (px). */
  DEFAULT_SIZE: 14,
  /** Create shielding icon radius (px). */
  CREATE_SHIELDING_ICON_RADIUS: 36,
} as const;

/** Settings for common/view/ControlFactory.ts. */
export const CONTROL_FACTORY_SETTINGS = {
  RADIO_GROUP_SPACING: 4, // px

  /** Control font size (px). */
  CONTROL_FONT_SIZE: 13,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 14,
  /** Push button x margin (px). */
  PUSH_BUTTON_X_MARGIN: 8,
  /** Push button y margin (px). */
  PUSH_BUTTON_Y_MARGIN: 4,
  /** Radio group radius (px). */
  RADIO_GROUP_RADIUS: 6,
} as const;

/** Settings for preferences/PeriodicTrendsPreferencesNode.ts. */
export const PERIODIC_TRENDS_PREFERENCES_NODE_SETTINGS = {
  ITEM_3_SPACING: 6, // px

  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Electron volts checkbox font size (px). */
  ELECTRON_VOLTS_CHECKBOX_FONT_SIZE: 14,
  /** Electron volts checkbox spacing (px). */
  ELECTRON_VOLTS_CHECKBOX_SPACING: 8,
  /** Option text font size (px). */
  OPTION_TEXT_FONT_SIZE: 14,
  /** Extent radio spacing (px). */
  EXTENT_RADIO_SPACING: 6,
  /** Extent radio radius (px). */
  EXTENT_RADIO_RADIUS: 7,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
  /** Constructor x (px). */
  CONSTRUCTOR_X: 10,
} as const;

/** Settings for shielding/view/EffectiveChargeNode.ts. */
export const EFFECTIVE_CHARGE_NODE_SETTINGS = {
  CONSTRUCTOR_MIN_WIDTH_OFFSET: 24, // px

  /** Bar height (px). */
  BAR_HEIGHT: 12,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 4,
} as const;

/** Settings for shielding/view/ElementPickerNode.ts. */
export const ELEMENT_PICKER_NODE_SETTINGS = {
  LABEL_MAX_WIDTH_OFFSET: 4, // px

  /** Extra space above the detached lanthanide row. */
  LANTHANIDE_GAP: 6,
  /** Background corner radius (px). */
  BACKGROUND_CORNER_RADIUS: 2,
  /** Label font size (px). */
  LABEL_FONT_SIZE: 10,
  /** Placeholder font size (px). */
  PLACEHOLDER_FONT_SIZE: 10,
} as const;

/** Settings for shielding/view/ShellAtomNode.ts. */
export const SHELL_ATOM_NODE_SETTINGS = {
  RING_LINE_WIDTH: 1.5, // px
  RING_LINE_DASH_DASH: 6, // px
  REBUILD_RING_LINE_DASH_DASH: 4, // px
  CHARGE_MAX_WIDTH_FACTOR: 1.8, // dimensionless

  LABEL_BACKGROUND_DILATION: 2, // px

  /** Innermost ring radius when rings are spread evenly beyond krypton (px). */
  FIRST_RING: 30,
  /** Outermost ring radius when rings are spread evenly beyond krypton (px). */
  LAST_RING: 168,
  /** Electrons on a ring keep at least this gap between centres. */
  MIN_ELECTRON_SPACING: 3,
  /** Nucleus radius (px). */
  NUCLEUS_RADIUS: 18,
  /** Electron radius (px). */
  ELECTRON_RADIUS: 5,
  /** Target radius (px). */
  TARGET_RADIUS: 8,
  /** Rebuild line width (px). */
  REBUILD_LINE_WIDTH: 1.5,
  /** Label background corner radius (px). */
  LABEL_BACKGROUND_CORNER_RADIUS: 3,
} as const;

/** Settings for shielding/view/ShieldingLegendNode.ts. */
export const SHIELDING_LEGEND_NODE_SETTINGS = {
  ROW_MAX_WIDTH_OFFSET: 20, // px
  CONSTRUCTOR_MIN_WIDTH_OFFSET: 24, // px

  TARGET_ELECTRON_COLOR_ROW_RADIUS: 7, // px

  /** Default radius (px). */
  DEFAULT_RADIUS: 5,
  /** Row spacing (px). */
  ROW_SPACING: 6,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 5,
} as const;

/** Settings for shielding/view/ShieldingScreenView.ts. */
export const SHIELDING_SCREEN_VIEW_SETTINGS = {
  TARGET_PANEL_MIN_WIDTH_OFFSET: 24, // px

  PICKER_PANEL_ITEM_1_SPACING: 10, // px

  /** Centre line and largest scale of the atom, and content widths of the middle and right columns. */
  ATOM_CENTER_X: 258,
  /** Atom max scale (dimensionless). */
  ATOM_MAX_SCALE: 1.2,
  /** Middle content width (px). */
  MIDDLE_CONTENT_WIDTH: 280,
  /** Right content width (px). */
  RIGHT_CONTENT_WIDTH: 200,
  /** Title max width (px). */
  TITLE_MAX_WIDTH: 260,
  /** Configuration max width (px). */
  CONFIGURATION_MAX_WIDTH: 380,
  /** Picker panel spacing (px). */
  PICKER_PANEL_SPACING: 6,
  /** Target radio spacing (px). */
  TARGET_RADIO_SPACING: 5,
  /** Target radio radius (px). */
  TARGET_RADIO_RADIUS: 6,
  /** Target panel spacing (px). */
  TARGET_PANEL_SPACING: 8,
} as const;

/** Settings for shielding/view/SlaterBreakdownNode.ts. */
export const SLATER_BREAKDOWN_NODE_SETTINGS = {
  CONSTRUCTOR_MIN_WIDTH_OFFSET: 24, // px
  CELL_TEXT_MAX_WIDTH_FACTOR: 3, // dimensionless

  ITEM_1_SPACING: 5, // px

  /** Body spacing (px). */
  BODY_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 8,
  /** Constructor radius (px). */
  CONSTRUCTOR_RADIUS: 5,
  /** Table x spacing (px). */
  TABLE_X_SPACING: 14,
  /** Table y spacing (px). */
  TABLE_Y_SPACING: 4,
} as const;

/** Settings for trends/view/AnomalyBadge.ts. */
export const ANOMALY_BADGE_SETTINGS = {
  /** Radius (px). */
  RADIUS: 8,
  /** Label font size (px). */
  LABEL_FONT_SIZE: 10,
} as const;

/** Settings for trends/view/ElementCardNode.ts. */
export const ELEMENT_CARD_NODE_SETTINGS = {
  ITEM_2_SPACING: 2, // px

  /** Symbol font size (px). */
  SYMBOL_FONT_SIZE: 40,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for trends/view/ExplanationNode.ts. */
export const EXPLANATION_NODE_SETTINGS = {
  /** Body spacing (px). */
  BODY_SPACING: 8,
  /** Content spacing (px). */
  CONTENT_SPACING: 8,
  /** Notes spacing (px). */
  NOTES_SPACING: 6,
} as const;

/** Settings for trends/view/HeatLegendNode.ts. */
export const HEAT_LEGEND_NODE_SETTINGS = {
  /** Bar height (px). */
  BAR_HEIGHT: 10,
} as const;

/** Settings for trends/view/PeriodicTableNode.ts. */
export const PERIODIC_TABLE_NODE_SETTINGS = {
  NUMBER_LEFT_OFFSET: 3, // px
  VALUE_MAX_WIDTH_OFFSET: 4, // px
  PLACEHOLDER_LINE_DASH_DASH: 3, // px
  PLACEHOLDER_MAX_WIDTH_OFFSET: 4, // px
  CURSOR_RECTANGLE_LINE_DASH_DASH: 4, // px

  HEADER_Y_DILATION: 4, // px
  HEADER_X_DILATION: 4, // px

  /** Width of the period-number column and height of the group-number row. */
  HEADER_SIZE: 16,
  /** Extra space above the detached lanthanide row. */
  LANTHANIDE_GAP: 8,
  /** Selected line width (px). */
  SELECTED_LINE_WIDTH: 3,
  /** Background corner radius (px). */
  BACKGROUND_CORNER_RADIUS: 3,
  /** Number font size (px). */
  NUMBER_FONT_SIZE: 8,
  /** Symbol font size (px). */
  SYMBOL_FONT_SIZE: 14,
  /** Value font size (px). */
  VALUE_FONT_SIZE: 8,
  /** Placeholder corner radius (px). */
  PLACEHOLDER_CORNER_RADIUS: 3,
  /** Placeholder font size (px). */
  PLACEHOLDER_FONT_SIZE: 9,
  /** Cursor rectangle corner radius (px). */
  CURSOR_RECTANGLE_CORNER_RADIUS: 4,
  /** Cursor rectangle line width (px). */
  CURSOR_RECTANGLE_LINE_WIDTH: 2,
} as const;

/** Settings for trends/view/TrendChartNode.ts. */
export const TREND_CHART_NODE_SETTINGS = {
  REBUILD_TOP_OFFSET: 4, // px
  REBUILD_LINE_DASH_DASH: 5, // px
  REBUILD_LEFT_OFFSET: 6, // px
  REBUILD_BOTTOM_OFFSET: 10, // px

  LINE_WIDTH: 2, // px
  LINE_WIDTH_VARIANT_2: 2.5, // px

  /** Point radius (px). */
  POINT_RADIUS: 4,
  /** Highlight radius (px). */
  HIGHLIGHT_RADIUS: 8,
  /** More points than this along the x axis and only some are labelled. */
  MAX_LABELLED_POINTS: 40,
  /** Z eff tick (px). */
  Z_EFF_TICK: 3,
  /** X range min (control/model units). */
  X_RANGE_MIN: -0.5,
  /** Rebuild right (px). */
  REBUILD_RIGHT: -6,
  /** Y-axis title right edge relative to the chart origin (px). */
  Y_TITLE_RIGHT: -38,
  /** Chart title bottom edge relative to the chart origin (px). */
  TITLE_BOTTOM: -8,
  /** Rebuild line width (px). */
  REBUILD_LINE_WIDTH: 1.5,
  /** Rebuild radius (px). */
  REBUILD_RADIUS: 2.5,
  /** Rebuild bottom (px). */
  REBUILD_BOTTOM: -8,
} as const;

/** Settings for trends/view/TrendsScreenView.ts. */
export const TRENDS_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 10, // px
  CONSTRUCTOR_CENTER_Y_FACTOR: 0.42, // dimensionless
  CONSTRUCTOR_BOTTOM_OFFSET: 4, // px

  /** Graph geometry; the left margin leaves room for the tick labels and the y-axis title. */
  CHART_LEFT: 70,
  /** Chart width (px). */
  CHART_WIDTH: 560,
  /** Chart bottom (px). */
  CHART_BOTTOM: 536,
  /** Space between the bottom of the table and the top of the plotting area (graph title, legend). */
  CHART_GAP: 50,
  /** The table is scaled down to this height when a larger extent would make it taller. */
  MAX_TABLE_HEIGHT: 250,
  /** Control panel spacing (px). */
  CONTROL_PANEL_SPACING: 8,
} as const;

/** Defaults for public query parameter `maxZ`. */
export const PERIODIC_TRENDS_QUERY_PARAMETERS_SETTINGS = {
  /** Default last element on the table (through Kr). */
  MAX_Z_DEFAULT: 36,
} as const;

PeriodicTrendsNamespace.register("PeriodicTrendsConstants", {
  KJ_PER_MOL_PER_EV,
  DEFAULT_ELEMENT_Z,
  DEFAULT_PERIOD,
  MAX_Z_EFF_AXIS,
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL_SPACING,
  SIDE_COLUMN_WIDTH,
  CELL_WIDTH,
  CELL_HEIGHT,
  MINI_CELL_WIDTH,
  MINI_CELL_HEIGHT,
  FONT_SIZE,
});
