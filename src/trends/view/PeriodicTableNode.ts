/**
 * PeriodicTableNode.ts
 *
 * The periodic table, as far as the chosen TableExtent (Kr, Xe or Rn), each cell coloured by the
 * chosen property. Click selects an element; dragging from an element across a row or down a
 * column selects a period or group run; the period and group numbers select a whole row or column.
 * Through radon, La–Lu sit in a detached row; the "57–71" slot in group 3 selects them all.
 *
 * Every element's cell is built once; cells beyond the extent are hidden, and the screen view
 * scales the table to fit (see `naturalHeight`).
 *
 * Keyboard: the table is one focusable grid. Arrows move a cursor (skipping empty slots), Enter or
 * Space selects, Shift+arrows extends a run from where the extension started, and P / G select
 * the cursor's whole period / group. The parallel DOM describes each element as the cursor moves.
 */

import { BooleanProperty, Multilink, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import {
  DragListener,
  FireListener,
  KeyboardListener,
  Node,
  type PressListenerEvent,
  Rectangle,
  Text,
} from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import {
  ELEMENTS,
  FIRST_LANTHANIDE,
  GROUP_COUNT,
  getElement,
  LANTHANIDE_ROW,
  LAST_LANTHANIDE,
} from "../../common/model/ElementData.js";
import { LANTHANIDE_PLACEHOLDER, type TableExtent } from "../../common/model/TableExtent.js";
import {
  type GridCell,
  groupSelection,
  periodSelection,
  selectionFromDrag,
  singleSelection,
  stepCell,
  type TrendSelection,
} from "../../common/model/TrendSelection.js";
import PeriodicTrendsHotkeyData from "../../common/PeriodicTrendsHotkeyData.js";
import {
  cellText,
  displayValue,
  elementName,
  propertyName,
  readout,
  toDisplayUnits,
} from "../../common/view/formatValues.js";
import { HEAT_COLOR_PROPERTIES, heatFill, textColorFor } from "../../common/view/heatColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { CELL_HEIGHT, CELL_WIDTH, FONT_SIZE } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";

/** Width of the period-number column and height of the group-number row. */
const HEADER_SIZE = 16;

/** Extra space above the detached lanthanide row. */
const LANTHANIDE_GAP = 8;

/** Inset of each cell's rectangle inside its slot. */
const CELL_GAP = 1;

const SELECTED_LINE_WIDTH = 3;

type CellNodes = {
  readonly node: Node;
  readonly background: Rectangle;
  readonly number: Text;
  readonly symbol: Text;
  readonly value: Text;
};

export class PeriodicTableNode extends Node {
  /** Keyboard cursor. */
  private readonly cursorProperty: Property<GridCell>;

  /** Start of a Shift+arrow extension, or null when the next Shift+arrow starts one. */
  private extensionAnchor: GridCell | null = null;

  /** Keyboard commits keep the cursor at the moving endpoint, rather than the selection anchor. */
  private committingKeyboardSelection = false;

  /**
   * @param model - Trends model
   * @param electronVoltsProperty - energies in eV instead of kJ/mol
   * @param describeSelection - spoken response for a committed selection
   */
  private readonly model: TrendsModel;
  private readonly describeSelection: (selection: TrendSelection) => string;

  public constructor(
    model: TrendsModel,
    electronVoltsProperty: TReadOnlyProperty<boolean>,
    describeSelection: (selection: TrendSelection) => string,
  ) {
    const a11y = StringManager.getInstance().getTrendsA11yStrings();
    super({
      tagName: "div",
      focusable: true,
      accessibleName: a11y.tableStringProperty,
      accessibleHelpText: a11y.tableHelpStringProperty,
    });
    this.model = model;
    this.describeSelection = describeSelection;

    const anchor = getElement(model.selectionProperty.value.anchorZ);
    this.cursorProperty = new Property<GridCell>(
      { row: anchor.row, column: anchor.column },
      { valueComparisonStrategy: (a, b) => a.row === b.row && a.column === b.column },
    );

    // ── Headers ─────────────────────────────────────────────────────────────────
    const headerFont = new PhetFont({ size: FONT_SIZE.tiny, weight: "bold" });
    for (let group = 1; group <= GROUP_COUNT; group++) {
      const header = new Text(String(group), {
        font: headerFont,
        fill: PeriodicTrendsColors.mutedTextColorProperty,
        centerX: HEADER_SIZE + (group - 0.5) * CELL_WIDTH,
        centerY: HEADER_SIZE / 2,
        cursor: "pointer",
      });
      header.mouseArea = header.localBounds.dilatedXY(CELL_WIDTH / 2 - header.width / 2, 4);
      header.addInputListener(
        new FireListener({ fire: () => model.select(groupSelection(model.tableExtentProperty.value, group)) }),
      );
      this.addChild(header);
    }
    const periodHeaders: Text[] = [];
    for (let period = 1; period <= 6; period++) {
      const header = new Text(String(period), {
        font: headerFont,
        fill: PeriodicTrendsColors.mutedTextColorProperty,
        centerX: HEADER_SIZE / 2,
        centerY: HEADER_SIZE + (period - 0.5) * CELL_HEIGHT,
        cursor: "pointer",
      });
      header.mouseArea = header.localBounds.dilatedXY(4, CELL_HEIGHT / 2 - header.height / 2);
      header.addInputListener(
        new FireListener({ fire: () => model.select(periodSelection(model.tableExtentProperty.value, period)) }),
      );
      this.addChild(header);
      periodHeaders.push(header);
    }

    // ── Cells ───────────────────────────────────────────────────────────────────
    const cellLayer = new Node({ cursor: "pointer" });
    this.addChild(cellLayer);
    const cells: CellNodes[] = ELEMENTS.map((element) => {
      const bounds = PeriodicTableNode.cellBounds(element.row, element.column);
      const background = new Rectangle(bounds.eroded(CELL_GAP), {
        cornerRadius: 3,
        stroke: PeriodicTrendsColors.cellStrokeColorProperty,
      });
      const number = new Text(String(element.z), {
        font: new PhetFont(8),
        left: bounds.minX + 3,
        top: bounds.minY + 2,
      });
      const symbol = new Text(element.symbol, {
        font: new PhetFont({ size: 14, weight: "bold" }),
        centerX: bounds.centerX,
        centerY: bounds.centerY - 1,
      });
      const value = new Text("", { font: new PhetFont(8), maxWidth: CELL_WIDTH - 4 });
      const node = new Node({ children: [background, number, symbol, value] });
      cellLayer.addChild(node);
      return { node, background, number, symbol, value };
    });

    // The period-6 slot of group 3 stands for La–Lu; clicking it selects them all.
    const placeholderBounds = PeriodicTableNode.cellBounds(LANTHANIDE_PLACEHOLDER.row, LANTHANIDE_PLACEHOLDER.column);
    const placeholder = new Node({
      cursor: "pointer",
      children: [
        new Rectangle(placeholderBounds.eroded(CELL_GAP), {
          cornerRadius: 3,
          stroke: PeriodicTrendsColors.cellStrokeColorProperty,
          lineDash: [3, 2],
        }),
        new Text(`${FIRST_LANTHANIDE}–${LAST_LANTHANIDE}`, {
          font: new PhetFont(9),
          fill: PeriodicTrendsColors.mutedTextColorProperty,
          center: placeholderBounds.center,
          maxWidth: CELL_WIDTH - 4,
        }),
      ],
    });
    placeholder.addInputListener(
      new FireListener({
        fire: () => {
          const zs = model.tableExtentProperty.value.elementsInRow(LANTHANIDE_ROW).map((element) => element.z);
          this.commit({ kind: "period", zs, anchorZ: zs[0] ?? FIRST_LANTHANIDE });
        },
      }),
    );
    this.addChild(placeholder);

    // Only the elements, period numbers and placeholder of the chosen extent are shown.
    model.tableExtentProperty.link((table) => {
      ELEMENTS.forEach((element, i) => {
        const cell = cells[i];
        if (cell) {
          cell.node.visible = table.includes(element.z);
        }
      });
      periodHeaders.forEach((header, i) => {
        header.visible = i < table.periodCount;
      });
      placeholder.visible = table.hasLanthanides;
      this.reset();
    });

    // Fill, text and value of every cell follow the property, units, locale and colour profile.
    Multilink.multilinkAny(
      [
        model.periodicPropertyProperty,
        electronVoltsProperty,
        localeProperty,
        model.tableExtentProperty,
        ...HEAT_COLOR_PROPERTIES,
      ],
      () => {
        const property = model.periodicPropertyProperty.value;
        const electronVolts = electronVoltsProperty.value;
        const range = property.getRange(model.tableExtentProperty.value);
        const lo = toDisplayUnits(property, range.min, electronVolts);
        const hi = toDisplayUnits(property, range.max, electronVolts);
        ELEMENTS.forEach((element, i) => {
          const cell = cells[i];
          if (!cell) {
            return;
          }
          const v = displayValue(property, element, electronVolts);
          const fill = heatFill(v === null ? null : (v - lo) / (hi - lo));
          const textFill = textColorFor(fill);
          cell.background.fill = fill;
          cell.number.fill = textFill;
          cell.symbol.fill = textFill;
          cell.value.fill = textFill;
          cell.value.string = cellText(property, element, electronVolts);
          const bounds = PeriodicTableNode.cellBounds(element.row, element.column);
          cell.value.centerX = bounds.centerX;
          cell.value.bottom = bounds.maxY - 2;
        });
      },
    );

    // Selected cells get a thick outline.
    model.selectionProperty.link((selection) => {
      // Headers and other external selections start a fresh keyboard run. A Shift+arrow commit
      // must leave its cursor at the endpoint so the next key extends from there.
      if (!this.committingKeyboardSelection) {
        this.reset();
      }
      ELEMENTS.forEach((element, i) => {
        const cell = cells[i];
        if (cell) {
          const selected = selection.zs.includes(element.z);
          cell.background.stroke = selected
            ? PeriodicTrendsColors.selectionColorProperty
            : PeriodicTrendsColors.cellStrokeColorProperty;
          cell.background.lineWidth = selected ? SELECTED_LINE_WIDTH : 1;
        }
      });
    });

    // ── Keyboard cursor ─────────────────────────────────────────────────────────
    const keyboardActiveProperty = new BooleanProperty(false);
    const cursorRectangle = new Rectangle(0, 0, CELL_WIDTH + 2, CELL_HEIGHT + 2, {
      cornerRadius: 4,
      stroke: PeriodicTrendsColors.focusCellColorProperty,
      lineWidth: 2,
      lineDash: [4, 2],
      pickable: false,
      visibleProperty: keyboardActiveProperty,
    });
    this.addChild(cursorRectangle);
    this.cursorProperty.link((cell) => {
      cursorRectangle.center = PeriodicTableNode.cellBounds(cell.row, cell.column).center;
    });
    this.addInputListener({
      focus: () => {
        keyboardActiveProperty.value = true;
      },
      blur: () => {
        keyboardActiveProperty.value = false;
      },
    });
    // The focus outline is the dashed cursor, so the default highlight would only add clutter.
    this.focusHighlight = "invisible";

    // ── Pointer: click and drag ─────────────────────────────────────────────────
    let dragAnchor: GridCell | null = null;
    const cellAt = (event: PressListenerEvent): GridCell => {
      const point = this.globalToLocalPoint(event.pointer.point);
      const lanthanideTop = PeriodicTableNode.cellBounds(LANTHANIDE_ROW, 1).minY;
      const row =
        point.y >= lanthanideTop - LANTHANIDE_GAP / 2 && model.tableExtentProperty.value.hasLanthanides
          ? LANTHANIDE_ROW
          : Math.min(Math.floor((point.y - HEADER_SIZE) / CELL_HEIGHT) + 1, LANTHANIDE_ROW - 1);
      return { row, column: Math.floor((point.x - HEADER_SIZE) / CELL_WIDTH) + 1 };
    };
    cellLayer.addInputListener(
      new DragListener({
        start: (event) => {
          const cell = cellAt(event);
          dragAnchor = model.tableExtentProperty.value.elementAt(cell.row, cell.column) ? cell : null;
          if (dragAnchor) {
            this.cursorProperty.value = dragAnchor;
            model.select(selectionFromDrag(model.tableExtentProperty.value, dragAnchor, cell));
          }
        },
        drag: (event) => {
          if (dragAnchor) {
            model.select(selectionFromDrag(model.tableExtentProperty.value, dragAnchor, cellAt(event)));
          }
        },
        end: () => {
          if (dragAnchor) {
            this.addAccessibleResponse(this.describeSelection(model.selectionProperty.value));
          }
          dragAnchor = null;
        },
      }),
    );

    // ── Keyboard listener ───────────────────────────────────────────────────────
    this.addInputListener(
      new KeyboardListener({
        keyStringProperties: [
          ...PeriodicTrendsHotkeyData.MOVE_FOCUS.keyStringProperties,
          ...PeriodicTrendsHotkeyData.SELECT_ELEMENT.keyStringProperties,
          ...PeriodicTrendsHotkeyData.EXTEND_SELECTION.keyStringProperties,
          ...PeriodicTrendsHotkeyData.SELECT_PERIOD.keyStringProperties,
          ...PeriodicTrendsHotkeyData.SELECT_GROUP.keyStringProperties,
        ],
        fire: (_event, keysPressed) => this.handleKey(keysPressed, electronVoltsProperty.value),
      }),
    );
  }

  private handleKey(keys: string, electronVolts: boolean): void {
    const table = this.model.tableExtentProperty.value;
    const cursor = this.cursorProperty.value;
    const element = table.elementAt(cursor.row, cursor.column) ?? getElement(1);
    const z = element.z;
    const direction = keys.replace("shift+", "");
    const delta: Record<string, [number, number]> = {
      arrowLeft: [0, -1],
      arrowRight: [0, 1],
      arrowUp: [-1, 0],
      arrowDown: [1, 0],
    };
    const step = delta[direction];

    if (step && keys.startsWith("shift+")) {
      this.extensionAnchor ??= cursor;
      this.cursorProperty.value = stepCell(table, cursor, step[0], step[1]);
      this.commit(selectionFromDrag(table, this.extensionAnchor, this.cursorProperty.value), true);
    } else if (step) {
      this.extensionAnchor = null;
      this.cursorProperty.value = stepCell(table, cursor, step[0], step[1]);
      this.addAccessibleResponse(this.describeCursor(electronVolts));
    } else if (keys === "enter" || keys === "space") {
      this.extensionAnchor = null;
      this.commit(singleSelection(z), true);
    } else if (keys === "p") {
      this.extensionAnchor = null;
      this.commit(periodSelection(table, element.period, z), true);
    } else if (keys === "g" && element.group !== null) {
      this.extensionAnchor = null;
      this.commit(groupSelection(table, element.group, z), true);
    }
  }

  private commit(selection: TrendSelection, fromKeyboard = false): void {
    this.committingKeyboardSelection = fromKeyboard;
    try {
      this.model.select(selection);
    } finally {
      this.committingKeyboardSelection = false;
    }
    this.addAccessibleResponse(this.describeSelection(selection));
  }

  /** Spoken description of the element under the cursor. */
  private describeCursor(electronVolts: boolean): string {
    const cell = this.cursorProperty.value;
    const element = this.model.tableExtentProperty.value.elementAt(cell.row, cell.column);
    if (!element) {
      return "";
    }
    const property = this.model.periodicPropertyProperty.value;
    const a11y = StringManager.getInstance().getTrendsA11yStrings();
    const pattern = element.group === null ? a11y.focusedLanthanideStringProperty : a11y.focusedElementStringProperty;
    return StringUtils.fillIn(pattern.value, {
      name: elementName(element),
      symbol: element.symbol,
      z: element.z,
      period: element.period,
      group: element.group,
      property: propertyName(property),
      value: readout(property, element, electronVolts),
    });
  }

  /** Moves the keyboard cursor to an element (used when the selection changes elsewhere). */
  public moveCursorTo(z: number): void {
    const element = getElement(z);
    this.cursorProperty.value = { row: element.row, column: element.column };
  }

  /** Local bounds of the slot at (row, column); the lanthanide row sits a little lower. */
  public static cellBounds(row: number, column: number): Bounds2 {
    const x = HEADER_SIZE + (column - 1) * CELL_WIDTH;
    const y = HEADER_SIZE + (row - 1) * CELL_HEIGHT + (row === LANTHANIDE_ROW ? LANTHANIDE_GAP : 0);
    return new Bounds2(x, y, x + CELL_WIDTH, y + CELL_HEIGHT);
  }

  /** Bounds spanning slots (row1, column1) to (row2, column2), e.g. the empty d-block gap. */
  public static spanBounds(row1: number, column1: number, row2: number, column2: number): Bounds2 {
    return PeriodicTableNode.cellBounds(row1, column1).union(PeriodicTableNode.cellBounds(row2, column2));
  }

  /** Unscaled height of the table showing `table` (headers included). */
  public static naturalHeight(table: TableExtent): number {
    return PeriodicTableNode.cellBounds(table.rowCount, 1).maxY;
  }

  public reset(): void {
    this.extensionAnchor = null;
    this.moveCursorTo(this.model.selectionProperty.value.anchorZ);
  }
}
