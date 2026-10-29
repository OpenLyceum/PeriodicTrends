/**
 * periodicTrendsQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in PeriodicTrendsPreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?electronVolts=true` or `?maxZ=86` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import PeriodicTrendsNamespace from "../PeriodicTrendsNamespace.js";

const periodicTrendsQueryParameters = QueryStringMachine.getAll({
  /** Show ionization energy and electron affinity in eV instead of kJ/mol. */
  electronVolts: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },

  /** Last element on the table: 36 (through Kr), 54 (through Xe) or 86 (through Rn). */
  maxZ: {
    type: "number",
    defaultValue: 36,
    validValues: [36, 54, 86],
    public: true,
  },
});

PeriodicTrendsNamespace.register("periodicTrendsQueryParameters", periodicTrendsQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default periodicTrendsQueryParameters;
