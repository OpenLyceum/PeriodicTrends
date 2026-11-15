/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * The graph, the explanation and the atom rebuild their children on every change and
 * dispose the old ones; AnomalyBadge is the one node created per rebuild that is not
 * plain Text or Circle, so it is listed here.
 *
 * TrendChartNode, ExplanationNode, ShellAtomNode, SlaterBreakdownNode and EffectiveChargeNode
 * live as long as their screen and link model Properties and `localeProperty` in Multilinks that
 * are never torn down, so they are deliberately not in the disposal list (they would be retained
 * by those long-lived Properties). What matters is that every rebuild disposes its old children:
 * the tests below check that driving the models leaves the listener counts of the Properties they
 * observe, and of the colour profile and strings their children use, unchanged.
 */

import { EnumerationProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { describe, expect, it } from "vitest";
import { PeriodicProperty } from "../src/common/model/PeriodicProperty.js";
import { SelectedElementModel } from "../src/common/model/SelectedElementModel.js";
import { TableExtent } from "../src/common/model/TableExtent.js";
import { groupSelection, periodSelection, singleSelection } from "../src/common/model/TrendSelection.js";
import { StringManager } from "../src/i18n/StringManager.js";
import PeriodicTrendsColors from "../src/PeriodicTrendsColors.js";
import { PeriodicTrendsPreferencesModel } from "../src/preferences/PeriodicTrendsPreferencesModel.js";
import { ShieldingModel } from "../src/shielding/model/ShieldingModel.js";
import { EffectiveChargeNode } from "../src/shielding/view/EffectiveChargeNode.js";
import { ShellAtomNode } from "../src/shielding/view/ShellAtomNode.js";
import { SlaterBreakdownNode } from "../src/shielding/view/SlaterBreakdownNode.js";
import { TrendsModel } from "../src/trends/model/TrendsModel.js";
import { AnomalyBadge } from "../src/trends/view/AnomalyBadge.js";
import { ExplanationNode } from "../src/trends/view/ExplanationNode.js";
import { TrendChartNode } from "../src/trends/view/TrendChartNode.js";
import { describeDisposalLeaks, forceGC } from "./helpers/memoryLeak.js";

describeDisposalLeaks([{ name: "AnomalyBadge", create: () => new AnomalyBadge(1), idempotentDispose: true }]);

/** Listener count of a Property (public at runtime, private in the type declarations). */
const listenerCount = (property: object): number =>
  (property as unknown as { getListenerCount(): number }).getListenerCount();

const survivors = (refs: readonly WeakRef<object>[]): number => refs.filter((r) => r.deref() !== undefined).length;

/** The long-lived objects main.ts builds: the shared element model and the three screens' models. */
function createModels() {
  const tableExtentProperty = new EnumerationProperty(TableExtent.RADON);
  const selectedElement = new SelectedElementModel(tableExtentProperty);
  return {
    tableExtentProperty,
    selectedElement,
    trends: new TrendsModel(selectedElement),
    shielding: new ShieldingModel(selectedElement),
  };
}

type Models = ReturnType<typeof createModels>;

/** Everything a student can change on the Trends screen, in several orders. */
function driveTrends({ trends, tableExtentProperty }: Models): void {
  const table = tableExtentProperty.value;
  for (const property of PeriodicProperty.enumeration.values) {
    trends.periodicPropertyProperty.value = property;
  }
  trends.select(singleSelection(26));
  trends.select(groupSelection(table, 3));
  trends.select(periodSelection(table, 4));
  trends.showZEffProperty.toggle();
  trends.showZEffProperty.toggle();
  tableExtentProperty.value = TableExtent.KRYPTON;
  trends.select(periodSelection(TableExtent.KRYPTON, 3));
  tableExtentProperty.value = TableExtent.RADON;
  trends.reset();
}

/** Everything a student can change on the Shielding screen. */
function driveShielding({ shielding, selectedElement, tableExtentProperty }: Models): void {
  for (const z of [1, 6, 11, 26, 29, 36, 55, 79]) {
    selectedElement.zProperty.value = z;
    shielding.targetGroupProperty.value = shielding.shieldingProperty.value.contributions[0]?.group ?? "1s";
  }
  shielding.stepElement(1);
  shielding.stepElement(-2);
  tableExtentProperty.value = TableExtent.KRYPTON;
  tableExtentProperty.value = TableExtent.RADON;
  shielding.reset();
}

function createAndDropModels(): WeakRef<object>[] {
  const models = createModels();
  driveTrends(models);
  driveShielding(models);
  return [
    new WeakRef<object>(models.trends),
    new WeakRef<object>(models.shielding),
    new WeakRef<object>(models.selectedElement),
    new WeakRef<object>(models.tableExtentProperty),
  ];
}

function createAndDropPreferences(): WeakRef<object> {
  const preferences = new PeriodicTrendsPreferencesModel();
  preferences.electronVoltsProperty.toggle();
  preferences.tableExtentProperty.value = TableExtent.KRYPTON;
  preferences.reset();
  return new WeakRef<object>(preferences);
}

describe("models are collected after drop", () => {
  // The screen models link the shared table extent for the life of the sim, so they are dropped
  // together with the objects they link, as at page unload.
  it("Trends, Shielding and shared element models are collected as a group", async () => {
    const refs = Array.from({ length: 10 }, createAndDropModels).flat();
    await forceGC(refs);
    expect(survivors(refs)).toBe(0);
  });

  it("PeriodicTrendsPreferencesModel is collected after drop", async () => {
    const refs = Array.from({ length: 10 }, createAndDropPreferences);
    await forceGC(refs);
    expect(survivors(refs)).toBe(0);
  });
});

describe("rebuilding views does not accumulate listeners", () => {
  const strings = StringManager.getInstance();
  const trendsStrings = strings.getTrendsStrings();
  const shieldingStrings = strings.getShieldingStrings();
  const colors = PeriodicTrendsColors;

  it("TrendChartNode: selection, property, units and table changes leave listeners unchanged", () => {
    const models = createModels();
    const preferences = new PeriodicTrendsPreferencesModel();
    const chart = new TrendChartNode(models.trends, preferences.electronVoltsProperty, 400, 250);
    const properties = [
      models.trends.selectionProperty,
      models.trends.periodicPropertyProperty,
      models.trends.showZEffProperty,
      models.tableExtentProperty,
      preferences.electronVoltsProperty,
      localeProperty,
      trendsStrings.xAxisAllStringProperty,
      colors.textColorProperty,
      colors.chartGridColorProperty,
      colors.chartAxisColorProperty,
      colors.chartBackgroundColorProperty,
      colors.mutedTextColorProperty,
      colors.propertyCurveColorProperty,
      colors.zEffColorProperty,
      colors.anomalyColorProperty,
      colors.selectionColorProperty,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      driveTrends(models);
      preferences.electronVoltsProperty.toggle();
      chart.setChartHeight(200 + 10 * i);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });

  it("TrendChartNode: one rebuild adds no listeners beyond the first", () => {
    const models = createModels();
    const preferences = new PeriodicTrendsPreferencesModel();
    new TrendChartNode(models.trends, preferences.electronVoltsProperty, 400, 250);
    const property = colors.textColorProperty;
    models.trends.select(singleSelection(8));
    const once = listenerCount(property);
    for (let z = 1; z <= 30; z++) {
      models.trends.select(singleSelection(z));
    }
    expect(listenerCount(property)).toBe(once);
  });

  it("ExplanationNode: selection and property changes leave listeners unchanged", () => {
    const models = createModels();
    const preferences = new PeriodicTrendsPreferencesModel();
    new ExplanationNode(models.trends, preferences.electronVoltsProperty, 300, 400);
    const properties = [
      models.trends.selectionProperty,
      models.trends.periodicPropertyProperty,
      preferences.electronVoltsProperty,
      localeProperty,
      colors.textColorProperty,
      colors.selectionColorProperty,
      colors.anomalyColorProperty,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      driveTrends(models);
      preferences.electronVoltsProperty.toggle();
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });

  it("ShellAtomNode: changing element and target ring leaves listeners unchanged", () => {
    const models = createModels();
    new ShellAtomNode(
      models.shielding.elementProperty,
      models.shielding.shieldingProperty,
      models.shielding.targetGroupProperty,
    );
    const properties = [
      models.shielding.elementProperty,
      models.shielding.shieldingProperty,
      models.shielding.targetGroupProperty,
      colors.shellColorProperty,
      colors.targetElectronColorProperty,
      colors.mutedTextColorProperty,
      colors.backgroundColorProperty,
      colors.nucleusColorProperty,
      colors.cellTextLightColorProperty,
      colors.shieldSameGroupColorProperty,
      colors.shieldNMinusOneColorProperty,
      colors.shieldInnerColorProperty,
      colors.shieldOuterColorProperty,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      driveShielding(models);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });

  it("ShellAtomNode: rebuilding for each element adds no listeners per rebuild", () => {
    const models = createModels();
    new ShellAtomNode(
      models.shielding.elementProperty,
      models.shielding.shieldingProperty,
      models.shielding.targetGroupProperty,
    );
    models.selectedElement.zProperty.value = 8;
    const property = colors.shellColorProperty;
    const once = listenerCount(property);
    for (let z = 1; z <= 54; z++) {
      models.selectedElement.zProperty.value = z;
    }
    expect(listenerCount(property)).toBe(once);
  });

  it("SlaterBreakdownNode and EffectiveChargeNode: element changes leave listeners unchanged", () => {
    const models = createModels();
    new SlaterBreakdownNode(models.shielding.shieldingProperty, 300);
    new EffectiveChargeNode(models.shielding.shieldingProperty, models.tableExtentProperty, 300);
    const properties = [
      models.shielding.shieldingProperty,
      models.tableExtentProperty,
      localeProperty,
      shieldingStrings.columnGroupStringProperty,
      shieldingStrings.nuclearChargeStringProperty,
      colors.textColorProperty,
      colors.mutedTextColorProperty,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      driveShielding(models);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });
});
