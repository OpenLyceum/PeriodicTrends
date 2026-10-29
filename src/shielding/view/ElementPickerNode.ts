/**
 * ElementPickerNode.ts
 *
 * A compact 4 × 18 periodic table for choosing the element on the Shielding screen. Click a cell,
 * or focus the grid and use the arrow keys (each step selects, skipping empty slots).
 */

import type { NumberProperty } from "scenerystack/axon";
import { FireListener, KeyboardListener, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { ELEMENTS, elementAt, getElement } from "../../common/model/ElementData.js";
import { stepCell } from "../../common/model/TrendSelection.js";
import PeriodicTrendsHotkeyData from "../../common/PeriodicTrendsHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { MINI_CELL_HEIGHT, MINI_CELL_WIDTH } from "../../PeriodicTrendsConstants.js";

const ARROW_STEPS: Record<string, [number, number]> = {
  arrowLeft: [0, -1],
  arrowRight: [0, 1],
  arrowUp: [-1, 0],
  arrowDown: [1, 0],
};

export class ElementPickerNode extends Node {
  public constructor(zProperty: NumberProperty) {
    const a11y = StringManager.getInstance().getShieldingA11yStrings();
    super({
      tagName: "div",
      focusable: true,
      accessibleName: a11y.pickerStringProperty,
      accessibleHelpText: a11y.pickerHelpStringProperty,
    });

    const cells = ELEMENTS.map((element) => {
      const x = (element.group - 1) * MINI_CELL_WIDTH;
      const y = (element.period - 1) * MINI_CELL_HEIGHT;
      const background = new Rectangle(x + 1, y + 1, MINI_CELL_WIDTH - 2, MINI_CELL_HEIGHT - 2, {
        cornerRadius: 2,
        fill: PeriodicTrendsColors.panelBackgroundColorProperty,
        stroke: PeriodicTrendsColors.shellColorProperty,
        cursor: "pointer",
      });
      const label = new Text(element.symbol, {
        font: new PhetFont(10),
        fill: PeriodicTrendsColors.textColorProperty,
        center: background.center,
        pickable: false,
      });
      background.addInputListener(
        new FireListener({
          fire: () => {
            zProperty.value = element.z;
          },
        }),
      );
      this.addChild(background);
      this.addChild(label);
      return background;
    });

    zProperty.link((z) => {
      ELEMENTS.forEach((element, i) => {
        const cell = cells[i];
        if (cell) {
          const selected = element.z === z;
          cell.fill = selected
            ? PeriodicTrendsColors.selectionColorProperty
            : PeriodicTrendsColors.panelBackgroundColorProperty;
          cell.lineWidth = selected ? 2 : 1;
        }
      });
    });

    this.addInputListener(
      new KeyboardListener({
        keyStringProperties: PeriodicTrendsHotkeyData.CHOOSE_ELEMENT.keyStringProperties,
        fire: (_event, keysPressed) => {
          const step = ARROW_STEPS[keysPressed];
          const element = getElement(zProperty.value);
          if (step) {
            const cell = stepCell({ period: element.period, group: element.group }, step[0], step[1]);
            zProperty.value = elementAt(cell.period, cell.group)?.z ?? zProperty.value;
          }
        },
      }),
    );
  }
}
