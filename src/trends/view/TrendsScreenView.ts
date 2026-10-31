/**
 * TrendsScreenView.ts
 *
 * Trends screen layout: the periodic table across the top left (with the anchor element's card
 * and the colour key in the empty d-block gap), the graph below it, and on the right the
 * property controls and the "Why?" explanation. A hint runs along the bottom.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { PeriodicProperty } from "../../common/model/PeriodicProperty.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PeriodicTrendsButtonOptions.js";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { checkbox, heading, pushButton, radioGroup } from "../../common/view/ControlFactory.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE, PANEL_SPACING, SCREEN_VIEW_MARGIN, SIDE_COLUMN_WIDTH } from "../../PeriodicTrendsConstants.js";
import type { TrendsModel } from "../model/TrendsModel.js";
import { speakSelection } from "./describeSelection.js";
import { ElementCardNode } from "./ElementCardNode.js";
import { ExplanationNode } from "./ExplanationNode.js";
import { HeatLegendNode } from "./HeatLegendNode.js";
import { PeriodicTableNode } from "./PeriodicTableNode.js";
import { TrendChartNode } from "./TrendChartNode.js";
import { TrendsScreenSummaryContent } from "./TrendsScreenSummaryContent.js";

type SelfOptions = {
  /** Energies in eV instead of kJ/mol (Preferences). */
  electronVoltsProperty: TReadOnlyProperty<boolean>;
  /** Switches to the Shielding screen. */
  showShielding: () => void;
};

export type TrendsScreenViewOptions = SelfOptions & ScreenViewOptions;

/** Graph geometry; the left margin leaves room for the tick labels and the y-axis title. */
const CHART_LEFT = 70;
const CHART_WIDTH = 560;
const CHART_BOTTOM = 536;

/** Space between the bottom of the table and the top of the plotting area (graph title, legend). */
const CHART_GAP = 50;

/** The table is scaled down to this height when a larger extent would make it taller. */
const MAX_TABLE_HEIGHT = 250;

/** Panel content width in the right column (panel margins are 12 px each side). */
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

export class TrendsScreenView extends ScreenView {
  private readonly table: PeriodicTableNode;

  public constructor(model: TrendsModel, providedOptions: TrendsScreenViewOptions) {
    const options = optionize<TrendsScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new TrendsScreenSummaryContent(model, providedOptions.electronVoltsProperty),
      },
      providedOptions,
    );
    super(options);
    const electronVoltsProperty = options.electronVoltsProperty;
    const strings = StringManager.getInstance().getTrendsStrings();
    const a11y = StringManager.getInstance().getTrendsA11yStrings();
    const properties = StringManager.getInstance().getCommonStrings().properties;

    // ── Table, with the element card and colour key in the d-block gap ─────────
    this.table = new PeriodicTableNode(model, electronVoltsProperty, (selection) =>
      speakSelection(selection, model.periodicPropertyProperty.value, electronVoltsProperty.value),
    );

    // The card and colour key live in table coordinates so they scale with the table.
    const gap = PeriodicTableNode.spanBounds(1, 3, 3, 12);
    const card = new ElementCardNode(model, electronVoltsProperty, gap.width - 16);
    card.boundsProperty.link(() => {
      card.left = gap.minX + 10;
      card.centerY = gap.minY + gap.height * 0.42;
    });
    const legend = new HeatLegendNode(model, electronVoltsProperty, gap.width - 20);
    legend.left = gap.minX + 10;
    legend.bottom = gap.maxY - 4;
    const tableArea = new Node({ children: [this.table, card, legend] });
    this.addChild(tableArea);

    // ── Graph ───────────────────────────────────────────────────────────────────
    const chart = new TrendChartNode(model, electronVoltsProperty, CHART_WIDTH, CHART_BOTTOM - 236);
    chart.x = CHART_LEFT;
    this.addChild(chart);

    // A larger table is scaled to fit, and the graph takes the space left under it.
    model.tableExtentProperty.link((table) => {
      tableArea.setScaleMagnitude(Math.min(1, MAX_TABLE_HEIGHT / PeriodicTableNode.naturalHeight(table)));
      tableArea.left = SCREEN_VIEW_MARGIN;
      tableArea.top = SCREEN_VIEW_MARGIN / 2;
      const tableBottom = tableArea.top + PeriodicTableNode.naturalHeight(table) * tableArea.getScaleVector().y;
      chart.y = tableBottom + CHART_GAP;
      chart.setChartHeight(CHART_BOTTOM - chart.y);
    });

    // ── Controls ────────────────────────────────────────────────────────────────
    const propertyRadio = radioGroup(
      model.periodicPropertyProperty,
      [
        { value: PeriodicProperty.ATOMIC_RADIUS, label: properties.atomicRadiusStringProperty },
        { value: PeriodicProperty.IONIZATION_ENERGY, label: properties.ionizationEnergyStringProperty },
        { value: PeriodicProperty.ELECTRON_AFFINITY, label: properties.electronAffinityStringProperty },
        { value: PeriodicProperty.ELECTRONEGATIVITY, label: properties.electronegativityStringProperty },
        { value: PeriodicProperty.Z_EFF, label: properties.zEffStringProperty },
      ],
      a11y.propertyRadioStringProperty,
      SIDE_CONTENT_WIDTH - 20,
    );
    const zEffCheckbox = checkbox(
      model.showZEffProperty,
      strings.showZEffStringProperty,
      SIDE_CONTENT_WIDTH - 30,
      a11y.showZEffStringProperty,
    );
    const explainButton = pushButton(
      strings.explainButtonStringProperty,
      () => {
        // Shielding can change the shared element while Trends retains its visible selection.
        model.select(model.selectionProperty.value);
        options.showShielding();
      },
      a11y.explainButtonStringProperty,
    );
    const controlPanel = new PeriodicTrendsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.propertyStringProperty, SIDE_CONTENT_WIDTH),
          propertyRadio,
          zEffCheckbox,
          explainButton,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = SCREEN_VIEW_MARGIN / 2;
    this.addChild(controlPanel);

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // ── Explanation ─────────────────────────────────────────────────────────────
    const explanationTop = controlPanel.bottom + PANEL_SPACING;
    const explanation = new ExplanationNode(
      model,
      electronVoltsProperty,
      SIDE_CONTENT_WIDTH,
      resetAllButton.top - PANEL_SPACING - explanationTop - 20,
    );
    explanation.right = controlPanel.right;
    explanation.top = explanationTop;
    this.addChild(explanation);

    const hint = new Text(strings.hintStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      maxWidth: CHART_LEFT + CHART_WIDTH - SCREEN_VIEW_MARGIN,
    });
    hint.boundsProperty.link(() => {
      hint.left = SCREEN_VIEW_MARGIN;
      hint.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN / 2;
    });
    this.addChild(hint);

    this.addChild(
      new Node({
        pdomOrder: [this.table, propertyRadio, zEffCheckbox, explainButton, resetAllButton],
      }),
    );
  }

  public reset(): void {
    this.table.reset();
  }
}
