/**
 * PeriodicTableNode.ts
 *
 * The 4 × 18 periodic table (H to Kr), each cell coloured by the chosen property. Click selects an
 * element; dragging from an element across a row or down a column selects a period or group run;
 * the period and group numbers select a whole row or column.
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
import { ELEMENTS, elementAt, GROUP_COUNT, getElement, PERIOD_COUNT } from "../../common/model/ElementData.js";
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

/** Inset of each cell's rectangle inside its slot. */
const CELL_GAP = 1;

const SELECTED_LINE_WIDTH = 3;

type CellNodes = {
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
      { period: anchor.period, group: anchor.group },
      { valueComparisonStrategy: (a, b) => a.period === b.period && a.group === b.group },
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
      header.addInputListener(new FireListener({ fire: () => model.select(groupSelection(group)) }));
      this.addChild(header);
    }
    for (let period = 1; period <= PERIOD_COUNT; period++) {
      const header = new Text(String(period), {
        font: headerFont,
        fill: PeriodicTrendsColors.mutedTextColorProperty,
        centerX: HEADER_SIZE / 2,
        centerY: HEADER_SIZE + (period - 0.5) * CELL_HEIGHT,
        cursor: "pointer",
      });
      header.mouseArea = header.localBounds.dilatedXY(4, CELL_HEIGHT / 2 - header.height / 2);
      header.addInputListener(new FireListener({ fire: () => model.select(periodSelection(period)) }));
      this.addChild(header);
    }

    // ── Cells ───────────────────────────────────────────────────────────────────
    const cellLayer = new Node({ cursor: "pointer" });
    this.addChild(cellLayer);
    const cells: CellNodes[] = ELEMENTS.map((element) => {
      const bounds = PeriodicTableNode.cellBounds(element.period, element.group);
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
      cellLayer.addChild(new Node({ children: [background, number, symbol, value] }));
      return { background, number, symbol, value };
    });

    // Fill, text and value of every cell follow the property, units, locale and colour profile.
    Multilink.multilinkAny(
      [model.periodicPropertyProperty, electronVoltsProperty, localeProperty, ...HEAT_COLOR_PROPERTIES],
      () => {
        const property = model.periodicPropertyProperty.value;
        const electronVolts = electronVoltsProperty.value;
        const range = property.getRange();
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
          const bounds = PeriodicTableNode.cellBounds(element.period, element.group);
          cell.value.centerX = bounds.centerX;
          cell.value.bottom = bounds.maxY - 2;
        });
      },
    );

    // Selected cells get a thick outline.
    model.selectionProperty.link((selection) => {
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
      cursorRectangle.center = PeriodicTableNode.cellBounds(cell.period, cell.group).center;
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
      return {
        period: Math.floor((point.y - HEADER_SIZE) / CELL_HEIGHT) + 1,
        group: Math.floor((point.x - HEADER_SIZE) / CELL_WIDTH) + 1,
      };
    };
    cellLayer.addInputListener(
      new DragListener({
        start: (event) => {
          const cell = cellAt(event);
          dragAnchor = elementAt(cell.period, cell.group) ? cell : null;
          if (dragAnchor) {
            this.cursorProperty.value = dragAnchor;
            model.select(selectionFromDrag(dragAnchor, cell));
          }
        },
        drag: (event) => {
          if (dragAnchor) {
            model.select(selectionFromDrag(dragAnchor, cellAt(event)));
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
    const cursor = this.cursorProperty.value;
    const z = elementAt(cursor.period, cursor.group)?.z ?? 1;
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
      this.cursorProperty.value = stepCell(cursor, step[0], step[1]);
      this.commit(selectionFromDrag(this.extensionAnchor, this.cursorProperty.value));
    } else if (step) {
      this.extensionAnchor = null;
      this.cursorProperty.value = stepCell(cursor, step[0], step[1]);
      this.addAccessibleResponse(this.describeCursor(electronVolts));
    } else if (keys === "enter" || keys === "space") {
      this.extensionAnchor = null;
      this.commit(singleSelection(z));
    } else if (keys === "p") {
      this.extensionAnchor = null;
      this.commit(periodSelection(cursor.period, z));
    } else if (keys === "g") {
      this.extensionAnchor = null;
      this.commit(groupSelection(cursor.group, z));
    }
  }

  private commit(selection: TrendSelection): void {
    this.model.select(selection);
    this.addAccessibleResponse(this.describeSelection(selection));
  }

  /** Spoken description of the element under the cursor. */
  private describeCursor(electronVolts: boolean): string {
    const cell = this.cursorProperty.value;
    const element = elementAt(cell.period, cell.group);
    if (!element) {
      return "";
    }
    const property = this.model.periodicPropertyProperty.value;
    return StringUtils.fillIn(StringManager.getInstance().getTrendsA11yStrings().focusedElementStringProperty.value, {
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
    this.cursorProperty.value = { period: element.period, group: element.group };
  }

  /** Local bounds of the slot at (period, group). */
  public static cellBounds(period: number, group: number): Bounds2 {
    const x = HEADER_SIZE + (group - 1) * CELL_WIDTH;
    const y = HEADER_SIZE + (period - 1) * CELL_HEIGHT;
    return new Bounds2(x, y, x + CELL_WIDTH, y + CELL_HEIGHT);
  }

  /** Bounds spanning slots (period1, group1) to (period2, group2), e.g. the empty d-block gap. */
  public static spanBounds(period1: number, group1: number, period2: number, group2: number): Bounds2 {
    return PeriodicTableNode.cellBounds(period1, group1).union(PeriodicTableNode.cellBounds(period2, group2));
  }

  public reset(): void {
    this.extensionAnchor = null;
    this.moveCursorTo(this.model.selectionProperty.value.anchorZ);
  }
}
