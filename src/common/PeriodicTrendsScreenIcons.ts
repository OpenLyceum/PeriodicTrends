/**
 * PeriodicTrendsScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons, drawn on the standard PhET 548 × 373 canvas.
 *   - Trends: a heat-mapped strip of period 3 cells with the rising ionization-energy curve.
 *   - Shielding: a nucleus with two shells, the outer electron highlighted.
 */
import { Shape } from "scenerystack/kite";
import { Circle, Color, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import PeriodicTrendsColors from "../PeriodicTrendsColors.js";
import { TableExtent } from "./model/TableExtent.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: PeriodicTrendsColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: PeriodicTrendsColors.backgroundColorProperty,
  });
}

export function createTrendsIcon(): ScreenIcon {
  const period = TableExtent.KRYPTON.elementsInPeriod(3);
  const cellWidth = (W - 80) / period.length;
  const minIE = Math.min(...period.map((e) => e.ionizationEnergy));
  const maxIE = Math.max(...period.map((e) => e.ionizationEnergy));
  const t = (ie: number) => (ie - minIE) / (maxIE - minIE);
  const cells = period.map(
    (element, i) =>
      new Rectangle(40 + i * cellWidth + 3, 250, cellWidth - 6, 80, {
        cornerRadius: 6,
        fill: Color.interpolateRGBA(
          PeriodicTrendsColors.heatLowColorProperty.value,
          PeriodicTrendsColors.heatHighColorProperty.value,
          t(element.ionizationEnergy),
        ),
      }),
  );
  const curve = new Shape();
  period.forEach((element, i) => {
    const x = 40 + (i + 0.5) * cellWidth;
    const y = 220 - 170 * t(element.ionizationEnergy);
    i === 0 ? curve.moveTo(x, y) : curve.lineTo(x, y);
  });
  return iconFrom(
    new Node({
      children: [
        background(),
        ...cells,
        new Path(curve, { stroke: PeriodicTrendsColors.propertyCurveColorProperty, lineWidth: 8 }),
      ],
    }),
  );
}

export function createShieldingIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  const shell = (r: number) =>
    new Circle(r, { x: cx, y: cy, stroke: PeriodicTrendsColors.shellColorProperty, lineWidth: 5 });
  const electron = (r: number, angle: number, fill: Color | typeof PeriodicTrendsColors.zEffColorProperty, size = 14) =>
    new Circle(size, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), fill });
  const inner = PeriodicTrendsColors.shieldInnerColorProperty;
  return iconFrom(
    new Node({
      children: [
        background(),
        shell(80),
        shell(150),
        new Circle(36, { x: cx, y: cy, fill: PeriodicTrendsColors.nucleusColorProperty }),
        electron(80, 0, inner),
        electron(80, Math.PI, inner),
        electron(150, -Math.PI / 2, PeriodicTrendsColors.targetElectronColorProperty, 20),
      ],
    }),
  );
}
