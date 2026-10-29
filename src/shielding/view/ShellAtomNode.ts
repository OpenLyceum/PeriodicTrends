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
import {
  groupCounts,
  groupLabel,
  isInnerSubshellGroup,
  type ShieldingResult,
  type SlaterGroupId,
} from "../../common/model/Slater.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import { colorForKind } from "./shieldingColors.js";

/** Ring radius of each Slater group up to (4s, 4p), in view units. */
const RING_RADIUS: Partial<Record<SlaterGroupId, number>> = {
  "1s": 32,
  "2sp": 66,
  "3sp": 100,
  "3d": 128,
  "4sp": 162,
};

/** Innermost and outermost ring radii when the rings are spread evenly (beyond krypton). */
const FIRST_RING = 30;
const LAST_RING = 168;

/** Electrons on a ring keep at least this gap between centres. */
const MIN_ELECTRON_SPACING = 3;

/**
 * Ring radius of each occupied group. Up to krypton the rings sit at fixed radii; beyond, with
 * up to ten rings, they are spread evenly between FIRST_RING and LAST_RING.
 */
function ringRadii(groups: readonly SlaterGroupId[]): Map<SlaterGroupId, number> {
  const fixed = groups.every((group) => RING_RADIUS[group] !== undefined);
  const step = groups.length > 1 ? (LAST_RING - FIRST_RING) / (groups.length - 1) : 0;
  return new Map(groups.map((group, i) => [group, fixed ? (RING_RADIUS[group] ?? 0) : FIRST_RING + i * step]));
}

const NUCLEUS_RADIUS = 18;
const ELECTRON_RADIUS = 5;
const TARGET_RADIUS = 8;

/** Angles of the ring labels, measured from +x towards +y; alternate rings alternate sides. */
const LABEL_ANGLES = [(3 * Math.PI) / 4, Math.PI / 4];

export class ShellAtomNode extends Node {
  /** Largest extent from the centre in local units: the outermost ring and its target electron. */
  public static readonly MAX_RADIUS = LAST_RING + TARGET_RADIUS + 4;

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
    const radii = ringRadii(result.contributions.map((contribution) => contribution.group));

    result.contributions.forEach((contribution, ringIndex) => {
      const group = contribution.group;
      const radius = radii.get(group) ?? FIRST_RING;
      const isTarget = group === result.target;
      const ring = new Circle(radius, {
        stroke: isTarget ? PeriodicTrendsColors.targetElectronColorProperty : PeriodicTrendsColors.shellColorProperty,
        lineWidth: isTarget ? 2 : 1.5,
        lineDash: isInnerSubshellGroup(group) ? [6, 4] : [],
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
      // A crowded ring (4f¹⁴ on a small radius) draws smaller electrons.
      const electronRadius = Math.min(ELECTRON_RADIUS, (Math.PI * radius) / count - MIN_ELECTRON_SPACING / 2);
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
            new Circle(Math.max(electronRadius, 1.5), {
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
      const labelAngle = LABEL_ANGLES[ringIndex % LABEL_ANGLES.length] ?? 0;
      label.center = label.center.setXY(radius * Math.cos(labelAngle), radius * Math.sin(labelAngle));
      const labelBackground = Rectangle.bounds(label.bounds.dilated(2), {
        fill: PeriodicTrendsColors.backgroundColorProperty,
        cornerRadius: 3,
        pickable: false,
      });
      nodes.push(labelBackground, label);
    });

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
