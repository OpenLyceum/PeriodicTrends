/**
 * ElementPickerNode.ts
 *
 * A compact periodic table, as large as the table on show, for choosing the element on the
 * Shielding screen. Click a cell, or focus the grid and use the arrow keys (each step selects,
 * skipping empty slots; down from group 3 reaches the lanthanide row).
 */

import type { NumberProperty, TReadOnlyProperty } from "scenerystack/axon";
import { FireListener, KeyboardListener, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { ELEMENTS, getElement, LANTHANIDE_ROW } from "../../common/model/ElementData.js";
import { LANTHANIDE_PLACEHOLDER, type TableExtent } from "../../common/model/TableExtent.js";
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

/** Extra space above the detached lanthanide row. */
const LANTHANIDE_GAP = 6;

/** Top-left of grid slot (row, column). */
function slotPosition(row: number, column: number): { x: number; y: number } {
  return {
    x: (column - 1) * MINI_CELL_WIDTH,
    y: (row - 1) * MINI_CELL_HEIGHT + (row === LANTHANIDE_ROW ? LANTHANIDE_GAP : 0),
  };
}

export class ElementPickerNode extends Node {
  public constructor(zProperty: NumberProperty, tableExtentProperty: TReadOnlyProperty<TableExtent>) {
    const a11y = StringManager.getInstance().getShieldingA11yStrings();
    super({
      tagName: "div",
      focusable: true,
      accessibleName: a11y.pickerStringProperty,
      accessibleHelpText: a11y.pickerHelpStringProperty,
      // Hidden cells beyond the table on show must not keep the picker (and its panel) large.
      excludeInvisibleChildrenFromBounds: true,
    });

    // Every element gets a cell; cells beyond the table on show are hidden.
    const cells = ELEMENTS.map((element) => {
      const { x, y } = slotPosition(element.row, element.column);
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
        maxWidth: MINI_CELL_WIDTH - 4,
        pickable: false,
      });
      background.addInputListener(
        new FireListener({
          fire: () => {
            zProperty.value = element.z;
          },
        }),
      );
      const cell = new Node({ children: [background, label] });
      this.addChild(cell);
      return { cell, background };
    });

    // The period-6 slot of group 3 points to the lanthanide row.
    const placeholderPosition = slotPosition(LANTHANIDE_PLACEHOLDER.row, LANTHANIDE_PLACEHOLDER.column);
    const placeholder = new Text("*", {
      font: new PhetFont(10),
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      centerX: placeholderPosition.x + MINI_CELL_WIDTH / 2,
      centerY: placeholderPosition.y + MINI_CELL_HEIGHT / 2,
    });
    this.addChild(placeholder);

    tableExtentProperty.link((table) => {
      ELEMENTS.forEach((element, i) => {
        const entry = cells[i];
        if (entry) {
          entry.cell.visible = table.includes(element.z);
        }
      });
      placeholder.visible = table.hasLanthanides;
    });

    zProperty.link((z) => {
      ELEMENTS.forEach((element, i) => {
        const entry = cells[i];
        if (entry) {
          const selected = element.z === z;
          entry.background.fill = selected
            ? PeriodicTrendsColors.selectionColorProperty
            : PeriodicTrendsColors.panelBackgroundColorProperty;
          entry.background.lineWidth = selected ? 2 : 1;
        }
      });
    });

    this.addInputListener(
      new KeyboardListener({
        keyStringProperties: PeriodicTrendsHotkeyData.CHOOSE_ELEMENT.keyStringProperties,
        fire: (_event, keysPressed) => {
          const step = ARROW_STEPS[keysPressed];
          const table = tableExtentProperty.value;
          const element = getElement(zProperty.value);
          if (step) {
            const cell = stepCell(table, { row: element.row, column: element.column }, step[0], step[1]);
            zProperty.value = table.elementAt(cell.row, cell.column)?.z ?? zProperty.value;
          }
        },
      }),
    );
  }
}
