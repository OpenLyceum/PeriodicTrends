/**
 * ShieldingScreenView.ts
 *
 * Shielding screen layout: the element picker and the atom on the left, Slater's rules worked out
 * and the effective charge in the middle, and on the right the choice of electron and the colour
 * key. Changing element is announced with the outer electron's Z_eff.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup } from "scenerystack/sun";
import { configurationText, MAX_Z, MIN_Z } from "../../common/model/ElementData.js";
import { valenceZEff } from "../../common/model/PeriodicProperty.js";
import { groupCounts, groupLabel, SLATER_GROUPS } from "../../common/model/Slater.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PeriodicTrendsButtonOptions.js";
import { PeriodicTrendsPanel } from "../../common/PeriodicTrendsPanel.js";
import { heading, label, pushButton } from "../../common/view/ControlFactory.js";
import { elementName, formatCharge } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import PeriodicTrendsColors from "../../PeriodicTrendsColors.js";
import { FONT_SIZE, PANEL_SPACING, SCREEN_VIEW_MARGIN } from "../../PeriodicTrendsConstants.js";
import type { ShieldingModel } from "../model/ShieldingModel.js";
import { EffectiveChargeNode } from "./EffectiveChargeNode.js";
import { ElementPickerNode } from "./ElementPickerNode.js";
import { ShellAtomNode } from "./ShellAtomNode.js";
import { ShieldingLegendNode } from "./ShieldingLegendNode.js";
import { ShieldingScreenSummaryContent } from "./ShieldingScreenSummaryContent.js";
import { SlaterBreakdownNode } from "./SlaterBreakdownNode.js";

export type ShieldingScreenViewOptions = ScreenViewOptions;

/** Centre of the atom, and content widths of the middle and right columns. */
const ATOM_CENTER_X = 258;
const ATOM_CENTER_Y = 402;
const ATOM_SCALE = 1.2;
const MIDDLE_CONTENT_WIDTH = 280;
const RIGHT_CONTENT_WIDTH = 200;

export class ShieldingScreenView extends ScreenView {
  public constructor(model: ShieldingModel, providedOptions?: ShieldingScreenViewOptions) {
    super({ screenSummaryContent: new ShieldingScreenSummaryContent(model), ...providedOptions });
    const strings = StringManager.getInstance().getShieldingStrings();
    const a11y = StringManager.getInstance().getShieldingA11yStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const zProperty = model.selectedElement.zProperty;

    // ── Element picker ──────────────────────────────────────────────────────────
    const title = new Text("", {
      font: new PhetFont({ size: FONT_SIZE.title, weight: "bold" }),
      fill: PeriodicTrendsColors.textColorProperty,
      maxWidth: 260,
    });
    const configuration = new Text("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: PeriodicTrendsColors.mutedTextColorProperty,
      maxWidth: 380,
    });
    Multilink.multilink([model.elementProperty, localeProperty], (element) => {
      title.string = StringUtils.fillIn(common.elementTitleStringProperty.value, {
        name: elementName(element),
        symbol: element.symbol,
      });
      configuration.string = configurationText(element.configuration);
    });
    const picker = new ElementPickerNode(zProperty);
    const previousButton = pushButton(
      strings.previousStringProperty,
      () => model.stepElement(-1),
      a11y.previousStringProperty,
    );
    const nextButton = pushButton(strings.nextStringProperty, () => model.stepElement(1), a11y.nextStringProperty);
    zProperty.link((z) => {
      previousButton.enabled = z > MIN_Z;
      nextButton.enabled = z < MAX_Z;
    });
    const pickerPanel = new PeriodicTrendsPanel(
      new VBox({
        align: "left",
        spacing: 6,
        children: [new HBox({ spacing: 10, children: [title, previousButton, nextButton] }), configuration, picker],
      }),
    );
    pickerPanel.left = SCREEN_VIEW_MARGIN;
    pickerPanel.top = SCREEN_VIEW_MARGIN / 2;
    this.addChild(pickerPanel);

    // ── Atom ────────────────────────────────────────────────────────────────────
    const atom = new ShellAtomNode(model.elementProperty, model.shieldingProperty, model.targetGroupProperty);
    atom.setScaleMagnitude(ATOM_SCALE);
    atom.x = ATOM_CENTER_X;
    atom.y = ATOM_CENTER_Y;
    this.addChild(atom);

    // ── Slater's rules and effective charge ─────────────────────────────────────
    const breakdown = new SlaterBreakdownNode(model.shieldingProperty, MIDDLE_CONTENT_WIDTH);
    breakdown.left = pickerPanel.right + PANEL_SPACING;
    breakdown.top = pickerPanel.top;
    this.addChild(breakdown);
    const effectiveCharge = new EffectiveChargeNode(model.shieldingProperty, MIDDLE_CONTENT_WIDTH);
    effectiveCharge.left = breakdown.left;
    breakdown.boundsProperty.link(() => {
      effectiveCharge.top = breakdown.bottom + PANEL_SPACING;
    });
    this.addChild(effectiveCharge);

    // ── Electron to look at, and colour key ─────────────────────────────────────
    const targetRadio = new AquaRadioButtonGroup(
      model.targetGroupProperty,
      SLATER_GROUPS.map((group) => ({
        value: group,
        createNode: () => label(groupLabel(group), RIGHT_CONTENT_WIDTH - 30),
        options: {
          accessibleName: groupLabel(group),
          // Only occupied groups can be chosen. Lives as long as the screen.
          enabledProperty: new DerivedProperty(
            [model.elementProperty],
            (element) => groupCounts(element.configuration)[group] > 0,
          ),
        },
      })),
      {
        spacing: 5,
        radioButtonOptions: { radius: 6, selectedColor: PeriodicTrendsColors.accentColorProperty },
        accessibleName: a11y.targetRadioStringProperty,
      },
    );
    const targetPanel = new PeriodicTrendsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [heading(strings.targetStringProperty, RIGHT_CONTENT_WIDTH), targetRadio],
      }),
      { minWidth: RIGHT_CONTENT_WIDTH + 24 },
    );
    targetPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    targetPanel.top = pickerPanel.top;
    this.addChild(targetPanel);
    const legend = new ShieldingLegendNode(RIGHT_CONTENT_WIDTH);
    legend.right = targetPanel.right;
    legend.top = targetPanel.bottom + PANEL_SPACING;
    this.addChild(legend);

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // Announce each new element with its outer electron's Z_eff.
    model.elementProperty.lazyLink((element) => {
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.elementChangedStringProperty.value, {
          name: elementName(element),
          zEff: formatCharge(valenceZEff(element)),
        }),
      );
    });

    this.addChild(new Node({ pdomOrder: [picker, previousButton, nextButton, targetRadio, resetAllButton] }));
  }
}
