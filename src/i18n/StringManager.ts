/**
 * StringManager.ts
 *
 * Centralizes all localized string access for the simulation.
 *
 * Strings are loaded from JSON files per locale and wrapped in reactive
 * Property objects by SceneryStack. When the user switches language in the
 * Preferences dialog, all StringProperties update automatically.
 *
 * ── How to add a locale ───────────────────────────────────────────────────────
 * 1. Create src/i18n/strings_XX.json with the same keys as strings_en.json
 * 2. Import it below and add `XX: stringsXX` to the locale map
 * 3. Add "XX" to `availableLocales` in src/init.ts
 *
 * ── How to add a string ───────────────────────────────────────────────────────
 * 1. Add the key + English value to strings_en.json
 * 2. Add the same key + translated value to ALL other locale files
 *    (TypeScript will show an error here if any locale is missing a key)
 * 3. Expose the new StringProperty via a new getter method below
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { LocalizedString } from "scenerystack/chipper";
import stringsEn from "./strings_en.json";
import stringsEs from "./strings_es.json";
import stringsFr from "./strings_fr.json";

// ── Compile-time key-parity check ─────────────────────────────────────────────
// English is the canonical shape; every other locale must match it exactly.
// TypeScript errors here if any locale file is missing (or adds) a key relative to
// English. Add one `satisfies` line per new locale so the check stays exhaustive.
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsFr satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsFr);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEs satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsEs);

// ── Build the reactive string property tree ───────────────────────────────────
const stringProperties = LocalizedString.getNestedStringProperties({
  en: stringsEn,
  fr: stringsFr,
  es: stringsEs,
});

/**
 * StringManager is a singleton that provides typed access to all localized
 * strings. Use `StringManager.getInstance()` everywhere — never construct it
 * directly.
 */
export class StringManager {
  private static instance: StringManager | null = null;

  private constructor() {
    // Private — obtain via getInstance()
  }

  public static getInstance(): StringManager {
    if (StringManager.instance === null) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  /**
   * The simulation title shown in the navigation bar and browser tab.
   * Updates automatically when the locale changes.
   */
  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.titleStringProperty;
  }

  /**
   * Screen name StringProperties used when constructing Screen instances.
   * Each property updates automatically when the locale changes.
   */
  public getScreenNames(): {
    readonly trendsStringProperty: ReadOnlyProperty<string>;
    readonly shieldingStringProperty: ReadOnlyProperty<string>;
  } {
    return {
      trendsStringProperty: stringProperties.screens.trendsStringProperty,
      shieldingStringProperty: stringProperties.screens.shieldingStringProperty,
    };
  }

  /** Element names keyed by symbol ("H" … "Kr"). */
  public getElementNames(): Readonly<Record<string, ReadOnlyProperty<string>>> {
    const names = stringProperties.elements as unknown as Record<string, ReadOnlyProperty<string>>;
    const bySymbol: Record<string, ReadOnlyProperty<string>> = {};
    for (const key of Object.keys(names)) {
      // getNestedStringProperties suffixes every leaf with "StringProperty".
      bySymbol[key.replace(/StringProperty$/, "")] = names[key] as ReadOnlyProperty<string>;
    }
    return bySymbol;
  }

  /** Strings shared by both screens: property names, units, value formats. */
  public getCommonStrings() {
    return stringProperties.common;
  }

  /** Visible strings of the Trends screen. */
  public getTrendsStrings() {
    return stringProperties.trends;
  }

  /** Visible strings of the Shielding screen. */
  public getShieldingStrings() {
    return stringProperties.shielding;
  }

  /** Labels for the keyboard-help dialogs. */
  public getKeyboardHelpStrings() {
    return stringProperties.keyboardHelp;
  }

  /** Accessibility strings for the Trends screen. */
  public getTrendsA11yStrings() {
    return stringProperties.a11y.trends;
  }

  /** Accessibility strings for the Shielding screen. */
  public getShieldingA11yStrings() {
    return stringProperties.a11y.shielding;
  }

  /**
   * Simulation-specific preference labels shown in Preferences → Simulation.
   */
  public getPreferences() {
    return stringProperties.preferences;
  }
}
