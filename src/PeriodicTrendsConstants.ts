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
