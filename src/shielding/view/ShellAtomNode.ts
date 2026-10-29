/**
 * ShellAtomNode.ts
 *
 * The atom drawn by Slater group: the nucleus (+Z) and one ring per occupied group, (1s) innermost
 * and (4s, 4p) outermost, with (3d) as its own ring between them. The 3d ring sits inside the 4s
 * ring although 4s fills first, which is the point: 3d electrons are inner electrons for 4s.
 *
 * The chosen electron is drawn large in the target colour; every other electron is tinted by how
 * much it shields that one (0.35, 0.85, 1.00 or nothing). Clicking a ring chooses an electron in it.
 */

import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Multilink } from "scenerystack/axon";
import { Circle, FireListener, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { ElementData } from "../../common/model/ElementData.js";
import { groupCounts, groupLabel, type ShieldingResult, type SlaterGroupId } from "../../common/model/Slater.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import { colorForKind } from "./shieldingColors.js";

/** Ring radius of each Slater group, in view units. */
const RING_RADIUS: Record<SlaterGroupId, number> = {
  "1s": 32,
  "2sp": 66,
  "3sp": 100,
  "3d": 128,
  "4sp": 162,
};

const NUCLEUS_RADIUS = 18;
const ELECTRON_RADIUS = 5;
const TARGET_RADIUS = 8;

/** Angle of a ring's label, measured from +x towards +y (lower left). */
const LABEL_ANGLE = (3 * Math.PI) / 4;

export class ShellAtomNode extends Node {
  private readonly content = new Node();

  public constructor(
    elementProperty: TReadOnlyProperty<ElementData>,
    shieldingProperty: TReadOnlyProperty<ShieldingResult>,
    targetGroupProperty: Property<SlaterGroupId>,
  ) {
    super();
    this.addChild(this.content);
    Multilink.multilink([elementProperty, shieldingProperty], (element, result) =>
      this.rebuild(element, result, targetGroupProperty),
    );
  }

  private rebuild(element: ElementData, result: ShieldingResult, targetGroupProperty: Property<SlaterGroupId>): void {
    for (const child of this.content.children) {
      child.dispose();
    }
    const counts = groupCounts(element.configuration);
    const nodes: Node[] = [];

    for (const contribution of result.contributions) {
      const group = contribution.group;
      const radius = RING_RADIUS[group];
      const isTarget = group === result.target;
      const ring = new Circle(radius, {
        stroke: isTarget ? PeriodicTrendsColors.targetElectronColorProperty : PeriodicTrendsColors.shellColorProperty,
        lineWidth: isTarget ? 2 : 1.5,
        lineDash: group === "3d" ? [6, 4] : [],
        cursor: "pointer",
      });
      // A ring is a thin target; widen its hit area to a band around it.
      ring.mouseArea = ring.localBounds.dilated(ELECTRON_RADIUS * 2);
      ring.touchArea = ring.mouseArea;
      ring.addInputListener(
        new FireListener({
          fire: () => {
            targetGroupProperty.value = group;
          },
        }),
      );
      nodes.push(ring);

      const count = counts[group];
      for (let k = 0; k < count; k++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * k) / count;
        const center = { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
        if (isTarget && k === 0) {
          nodes.push(
            new Circle(TARGET_RADIUS + 4, {
              x: center.x,
              y: center.y,
              stroke: PeriodicTrendsColors.targetElectronColorProperty,
              lineWidth: 1.5,
              pickable: false,
            }),
            new Circle(TARGET_RADIUS, {
              x: center.x,
              y: center.y,
              fill: PeriodicTrendsColors.targetElectronColorProperty,
              pickable: false,
            }),
          );
        } else {
          nodes.push(
            new Circle(ELECTRON_RADIUS, {
              x: center.x,
              y: center.y,
              fill: colorForKind(contribution.kind),
              pickable: false,
            }),
          );
        }
      }

      const label = new Text(groupLabel(group), {
        font: new PhetFont(FONT_SIZE.tiny),
        fill: PeriodicTrendsColors.mutedTextColorProperty,
        pickable: false,
      });
      label.center = label.center.setXY(radius * Math.cos(LABEL_ANGLE), radius * Math.sin(LABEL_ANGLE));
      const labelBackground = Rectangle.bounds(label.bounds.dilated(2), {
        fill: PeriodicTrendsColors.backgroundColorProperty,
        cornerRadius: 3,
        pickable: false,
      });
      nodes.push(labelBackground, label);
    }

    const nucleus = new Circle(NUCLEUS_RADIUS, { fill: PeriodicTrendsColors.nucleusColorProperty });
    const charge = new Text(`+${element.z}`, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: PeriodicTrendsColors.cellTextLightColorProperty,
      center: nucleus.center,
      maxWidth: NUCLEUS_RADIUS * 1.8,
    });
    nodes.push(nucleus, charge);
    this.content.children = nodes;
  }
}
