/**
 * TrendChartNode.ts
 *
 * The chosen property along the selection, on bamboo. A period or group run is plotted in order
 * (left to right, top to bottom); a single element shows all 36 elements against Z with the
 * element ringed, which is the classic sawtooth. Z_eff of the outer electron can be overlaid on a
 * second axis, and numbered badges mark the anomalies listed in the explanation.
 *
 * The y range is fixed per property (from all 36 elements) so runs can be compared by eye. The
 * whole chart is rebuilt when the selection, property, units, overlay or locale change; the old
 * nodes are disposed because they link to profile colours.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, TickMarkSet } from "scenerystack/bamboo";
import { Range, toFixed, Vector2 } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { Orientation } from "scenerystack/phet-core";
import { Circle, Node, RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { ELEMENTS, getElement, UNBOUND } from "../../common/model/ElementData.js";
import { type PeriodicProperty, valenceZEff } from "../../common/model/PeriodicProperty.js";
import { anomalyPosition } from "../../common/model/TrendAnomalies.js";
import type { TrendSelection } from "../../common/model/TrendSelection.js";
import { displayValue, propertyName, toDisplayUnits, unitOf } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE, MAX_Z_EFF_AXIS } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";
import { AnomalyBadge } from "./AnomalyBadge.js";
import { describeSelection, selectionTitle } from "./describeSelection.js";

const POINT_RADIUS = 4;
const HIGHLIGHT_RADIUS = 8;
const Z_EFF_TICK = 3;

/** A "nice" tick spacing (1, 2, 2.5 or 5 × 10ⁿ) giving about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10;
  return nice * magnitude;
}

/** Tick label with just enough decimals for the tick spacing. */
function tickText(value: number, step: number): string {
  const decimals = [0, 1, 2, 3].find((d) => Number(toFixed(step, d)) === step) ?? 3;
  return toFixed(value, decimals);
}

export class TrendChartNode extends Node {
  private readonly content = new Node();
  private readonly chartWidth: number;
  private readonly chartHeight: number;

  public constructor(
    model: TrendsModel,
    electronVoltsProperty: TReadOnlyProperty<boolean>,
    chartWidth: number,
    chartHeight: number,
  ) {
    super();
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.addChild(this.content);
    Multilink.multilink(
      [
        model.selectionProperty,
        model.periodicPropertyProperty,
        electronVoltsProperty,
        model.showZEffProperty,
        localeProperty,
      ],
      (selection, property, electronVolts, showZEff) => this.rebuild(selection, property, electronVolts, showZEff),
    );
  }

  private rebuild(
    selection: TrendSelection,
    property: PeriodicProperty,
    electronVolts: boolean,
    showZEff: boolean,
  ): void {
    for (const child of this.content.children) {
      child.dispose();
    }
    this.content.removeAllChildren();

    const strings = StringManager.getInstance().getTrendsStrings();
    const width = this.chartWidth;
    const height = this.chartHeight;
    const single = selection.kind === "single";
    const elements = single ? [...ELEMENTS] : selection.zs.map(getElement);
    const count = elements.length;

    // ── Scales ──────────────────────────────────────────────────────────────────
    const range = property.getRange();
    const yMax = toDisplayUnits(property, range.max, electronVolts);
    const yStep = niceStep(yMax, 5);
    const yTop = Math.ceil((yMax * 1.08) / yStep) * yStep;
    const xRange = new Range(-0.5, Math.max(count, 2) - 0.5);
    const chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: xRange,
      modelYRange: new Range(0, yTop),
    });
    const zEffTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: xRange,
      modelYRange: new Range(0, MAX_Z_EFF_AXIS),
    });

    const tickFont = new PhetFont(FONT_SIZE.tiny);
    const labelFont = new PhetFont(FONT_SIZE.small);
    const nodes: Node[] = [
      new ChartRectangle(chartTransform, {
        fill: PeriodicTrendsColors.chartBackgroundColorProperty,
        stroke: PeriodicTrendsColors.chartAxisColorProperty,
      }),
      new GridLineSet(chartTransform, Orientation.VERTICAL, yStep, {
        stroke: PeriodicTrendsColors.chartGridColorProperty,
      }),
      new TickMarkSet(chartTransform, Orientation.VERTICAL, yStep, {
        edge: "min",
        stroke: PeriodicTrendsColors.chartAxisColorProperty,
      }),
    ];

    // Left tick labels (property, display units).
    for (let y = 0; y <= yTop + 1e-9; y += yStep) {
      nodes.push(
        new Text(tickText(y, yStep), {
          font: tickFont,
          fill: PeriodicTrendsColors.textColorProperty,
          right: -6,
          centerY: chartTransform.modelToViewY(y),
        }),
      );
    }

    // X labels: element symbols.
    elements.forEach((element, i) => {
      const ringed = single && element.z === selection.anchorZ;
      nodes.push(
        new Text(element.symbol, {
          font: single ? tickFont : labelFont,
          fill: ringed ? PeriodicTrendsColors.selectionColorProperty : PeriodicTrendsColors.textColorProperty,
          fontWeight: ringed ? "bold" : "normal",
          centerX: chartTransform.modelToViewX(i),
          top: height + 4,
        }),
      );
    });

    // Axis titles.
    const unit = unitOf(property, electronVolts);
    const yTitle = new RichText(unit ? `${propertyName(property)} (${unit})` : propertyName(property), {
      font: labelFont,
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    yTitle.right = -38;
    yTitle.centerY = height / 2;
    const xTitle = new Text(
      single
        ? strings.xAxisAllStringProperty.value
        : selection.kind === "period"
          ? strings.xAxisPeriodStringProperty.value
          : strings.xAxisGroupStringProperty.value,
      { font: labelFont, fill: PeriodicTrendsColors.mutedTextColorProperty, maxWidth: width },
    );
    xTitle.centerX = width / 2;
    xTitle.top = height + 20;
    const title = new RichText(single ? strings.allElementsTitleStringProperty.value : selectionTitle(selection), {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: width,
    });
    title.left = 0;
    title.bottom = -8;
    nodes.push(yTitle, xTitle, title);

    // ── Z_eff overlay ───────────────────────────────────────────────────────────
    if (showZEff) {
      const zEffPoints = elements.map((element, i) => new Vector2(i, valenceZEff(element)));
      nodes.push(
        new LinePlot(zEffTransform, zEffPoints, {
          stroke: PeriodicTrendsColors.zEffColorProperty,
          lineWidth: 1.5,
          lineDash: [5, 4],
        }),
      );
      for (const point of zEffPoints) {
        nodes.push(
          new Circle(2.5, {
            fill: PeriodicTrendsColors.zEffColorProperty,
            center: zEffTransform.modelToViewPosition(point),
          }),
        );
      }
      for (let z = 0; z <= MAX_Z_EFF_AXIS; z += Z_EFF_TICK) {
        nodes.push(
          new Text(String(z), {
            font: tickFont,
            fill: PeriodicTrendsColors.zEffColorProperty,
            left: width + 6,
            centerY: zEffTransform.modelToViewY(z),
          }),
        );
      }
      const zEffTitle = new RichText(StringManager.getInstance().getCommonStrings().zEffStringProperty.value, {
        font: labelFont,
        fill: PeriodicTrendsColors.zEffColorProperty,
        rotation: Math.PI / 2,
      });
      zEffTitle.left = width + 20;
      zEffTitle.centerY = height / 2;
      nodes.push(zEffTitle);
    }

    // ── Property curve and points ───────────────────────────────────────────────
    const values = elements.map((element) => displayValue(property, element, electronVolts));
    nodes.push(
      new LinePlot(
        chartTransform,
        values.map((value, i) => (value === null ? null : new Vector2(i, value))),
        { stroke: PeriodicTrendsColors.propertyCurveColorProperty, lineWidth: 2 },
      ),
    );
    let hasUnbound = false;
    elements.forEach((element, i) => {
      const value = values[i];
      if (value === null || value === undefined) {
        return;
      }
      const unbound = property.getValue(element) === UNBOUND;
      hasUnbound ||= unbound;
      const center = chartTransform.modelToViewXY(i, value);
      nodes.push(
        new Circle(POINT_RADIUS, {
          center,
          fill: unbound
            ? PeriodicTrendsColors.chartBackgroundColorProperty
            : PeriodicTrendsColors.propertyCurveColorProperty,
          stroke: PeriodicTrendsColors.propertyCurveColorProperty,
          lineWidth: 1.5,
        }),
      );
      if (single && element.z === selection.anchorZ) {
        nodes.push(
          new Circle(HIGHLIGHT_RADIUS, { center, stroke: PeriodicTrendsColors.selectionColorProperty, lineWidth: 2.5 }),
        );
      }
    });
    if (hasUnbound) {
      nodes.push(
        new Text(strings.unboundLegendStringProperty.value, {
          font: tickFont,
          fill: PeriodicTrendsColors.mutedTextColorProperty,
          right: width,
          bottom: -8,
          maxWidth: width / 2,
        }),
      );
    }

    // ── Anomaly badges ──────────────────────────────────────────────────────────
    if (!single) {
      const anomalies = describeSelection(selection, property, electronVolts).anomalies;
      anomalies.forEach((anomaly, index) => {
        const x = anomalyPosition(anomaly, selection.zs);
        if (x === null) {
          return;
        }
        const neighbours = [Math.floor(x), Math.ceil(x)].map((j) => values[j] ?? 0);
        const y = Math.max(...neighbours.map((v) => v ?? 0));
        const badge = new AnomalyBadge(index + 1);
        badge.centerX = chartTransform.modelToViewX(x);
        badge.bottom = Math.max(badge.height, chartTransform.modelToViewY(y) - 10);
        nodes.push(badge);
      });
    }

    this.content.children = nodes;
  }
}
