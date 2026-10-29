/**
 * AnomalyBadge.ts
 *
 * A small numbered disc marking an anomaly on the graph and the matching note in the explanation.
 */

import { Circle, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";

const RADIUS = 8;

export class AnomalyBadge extends Node {
  public constructor(index: number) {
    const disc = new Circle(RADIUS, { fill: PeriodicTrendsColors.anomalyColorProperty });
    const label = new Text(String(index), {
      font: new PhetFont({ size: 10, weight: "bold" }),
      fill: PeriodicTrendsColors.cellTextLightColorProperty,
      center: disc.center,
    });
    super({ children: [disc, label] });
  }
}
