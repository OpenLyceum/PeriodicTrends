/**
 * describeSelection.ts
 *
 * The explanation of a selection in words: a title, the Z_eff-and-n story, the consequence for
 * the chosen property, and any anomalies on the run. The same pieces feed the visible
 * ExplanationNode (RichText markup) and the spoken descriptions (plain text).
 */

import { StringUtils } from "scenerystack/phetcommon";
import { getElement } from "../../common/model/ElementData.js";
import { type PeriodicProperty, valenceZEff } from "../../common/model/PeriodicProperty.js";
import { groupN, outermostGroup, shielding } from "../../common/model/Slater.js";
import { anomaliesFor, type TrendAnomaly } from "../../common/model/TrendAnomalies.js";
import type { TrendSelection } from "../../common/model/TrendSelection.js";
import { elementName, formatCharge, propertyName, readout } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";

export type SelectionDescription = {
  readonly title: string;
  /** Paragraphs as RichText markup. */
  readonly paragraphs: readonly string[];
  readonly anomalies: readonly TrendAnomaly[];
  /** Anomaly explanations as RichText markup, in the same order. */
  readonly anomalyTexts: readonly string[];
};

/** Principal quantum number of an element's outermost electron. */
export function valenceN(z: number): number {
  return groupN(outermostGroup(getElement(z).configuration));
}

/** Title of a selection: element name, or "Period 3: Na → Ar". */
export function selectionTitle(selection: TrendSelection): string {
  const common = StringManager.getInstance().getCommonStrings();
  const trends = StringManager.getInstance().getTrendsStrings();
  const first = getElement(selection.zs[0] ?? selection.anchorZ);
  const last = getElement(selection.zs[selection.zs.length - 1] ?? selection.anchorZ);
  if (selection.kind === "single") {
    return StringUtils.fillIn(common.elementTitleStringProperty.value, {
      name: elementName(first),
      symbol: first.symbol,
    });
  }
  if (selection.kind === "period") {
    return StringUtils.fillIn(trends.periodTitleStringProperty.value, {
      period: first.period,
      first: first.symbol,
      last: last.symbol,
    });
  }
  return StringUtils.fillIn(trends.groupTitleStringProperty.value, {
    group: first.group,
    first: first.symbol,
    last: last.symbol,
  });
}

/** Explanation text of an anomaly, with element symbols filled in. */
export function anomalyText(anomaly: TrendAnomaly): string {
  const texts = StringManager.getInstance().getTrendsStrings().anomalies;
  const template = {
    pBelowS: texts.pBelowSStringProperty,
    pairing: texts.pairingStringProperty,
    nobleGasRadius: texts.nobleGasRadiusStringProperty,
    dContraction: texts.dContractionStringProperty,
    dBlockFlat: texts.dBlockFlatStringProperty,
    unboundAnion: texts.unboundAnionStringProperty,
    halfFilledP: texts.halfFilledPStringProperty,
    fluorineCrowded: texts.fluorineCrowdedStringProperty,
    newShell: texts.newShellStringProperty,
  }[anomaly.key].value;
  return StringUtils.fillIn(template, { from: getElement(anomaly.fromZ).symbol, to: getElement(anomaly.toZ).symbol });
}

function consequence(selection: TrendSelection, property: PeriodicProperty, electronVolts: boolean): string {
  const consequences = StringManager.getInstance().getTrendsStrings().consequence;
  const set = selection.kind === "period" ? consequences.period : consequences.group;
  const template = {
    atomicRadius: set.atomicRadiusStringProperty,
    ionizationEnergy: set.ionizationEnergyStringProperty,
    electronAffinity: set.electronAffinityStringProperty,
    electronegativity: set.electronegativityStringProperty,
    zEff: set.zEffStringProperty,
  }[property.key].value;
  const first = getElement(selection.zs[0] ?? selection.anchorZ);
  const last = getElement(selection.zs[selection.zs.length - 1] ?? selection.anchorZ);
  return StringUtils.fillIn(template, {
    first: readout(property, first, electronVolts),
    last: readout(property, last, electronVolts),
  });
}

export function describeSelection(
  selection: TrendSelection,
  property: PeriodicProperty,
  electronVolts: boolean,
): SelectionDescription {
  const trends = StringManager.getInstance().getTrendsStrings();
  const anomalies = anomaliesFor(selection, property);
  const anomalyTexts = anomalies.map(anomalyText);
  const title = selectionTitle(selection);

  if (selection.kind === "single") {
    const element = getElement(selection.anchorZ);
    const result = shielding(element.z, element.configuration);
    const paragraphs = [
      StringUtils.fillIn(trends.singleStringProperty.value, {
        n: valenceN(element.z),
        zEff: formatCharge(result.zEff),
        z: element.z,
        s: formatCharge(result.s),
      }),
      StringUtils.fillIn(trends.singleValueStringProperty.value, {
        property: propertyName(property),
        value: readout(property, element, electronVolts),
      }),
      trends.singleHintStringProperty.value,
    ];
    return { title, paragraphs, anomalies, anomalyTexts };
  }

  const first = getElement(selection.zs[0] ?? selection.anchorZ);
  const last = getElement(selection.zs[selection.zs.length - 1] ?? selection.anchorZ);
  const story =
    selection.kind === "period"
      ? StringUtils.fillIn(trends.periodStringProperty.value, {
          period: first.period,
          n: valenceN(first.z),
          zEffFirst: formatCharge(valenceZEff(first)),
          zEffLast: formatCharge(valenceZEff(last)),
        })
      : StringUtils.fillIn(trends.groupStringProperty.value, {
          group: first.group,
          nFirst: valenceN(first.z),
          nLast: valenceN(last.z),
          zEffFirst: formatCharge(valenceZEff(first)),
          zEffLast: formatCharge(valenceZEff(last)),
        });
  return {
    title,
    paragraphs: [story, consequence(selection, property, electronVolts)],
    anomalies,
    anomalyTexts,
  };
}

/** Removes RichText markup for speech ("Z<sub>eff</sub>" → "Z eff"). */
export function toPlainText(markup: string): string {
  return markup
    .replace(/<sub>/g, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** One spoken response (or live summary) for a selection. */
export function speakSelection(selection: TrendSelection, property: PeriodicProperty, electronVolts: boolean): string {
  const a11y = StringManager.getInstance().getTrendsA11yStrings();
  if (selection.kind === "single") {
    const element = getElement(selection.anchorZ);
    return StringUtils.fillIn(a11y.currentDetailsSingleStringProperty.value, {
      name: elementName(element),
      property: propertyName(property),
      value: readout(property, element, electronVolts),
      zEff: formatCharge(valenceZEff(element)),
    });
  }
  const first = getElement(selection.zs[0] ?? selection.anchorZ);
  const last = getElement(selection.zs[selection.zs.length - 1] ?? selection.anchorZ);
  return StringUtils.fillIn(a11y.currentDetailsRunStringProperty.value, {
    title: selectionTitle(selection),
    property: propertyName(property),
    first: readout(property, first, electronVolts),
    last: readout(property, last, electronVolts),
    zEffFirst: formatCharge(valenceZEff(first)),
    zEffLast: formatCharge(valenceZEff(last)),
  });
}
