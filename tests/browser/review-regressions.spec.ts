import { expect, type Page, test } from "@playwright/test";
import type { EnumerationProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import type { Circle, RichText } from "scenerystack/scenery";
import type { ScreenView } from "scenerystack/sim";
import type { TableExtent } from "../../src/common/model/TableExtent.js";
import type { ShieldingModel } from "../../src/shielding/model/ShieldingModel.js";
import type { TrendsModel } from "../../src/trends/model/TrendsModel.js";

type SimulationWindow<Model> = {
  phet: {
    dot: Record<"Vector2", typeof Vector2>;
    joist: { sim: { selectedScreenProperty: { value: { model: Model; view: ScreenView } } } };
  };
};

test.use({ hasTouch: true });

function selection(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as SimulationWindow<TrendsModel>).phet.joist.sim.selectedScreenProperty.value.model
        .selectionProperty.value.zs,
  );
}

async function setExtent(page: Page, maxZ: number) {
  await page.evaluate((lastZ) => {
    const model = (window as unknown as SimulationWindow<TrendsModel>).phet.joist.sim.selectedScreenProperty.value
      .model;
    const extent = model.tableExtentProperty as EnumerationProperty<TableExtent>;
    const values = (extent.value.constructor as typeof TableExtent).enumeration.values;
    const table = values.find((value) => value.maxZ === lastZ);
    if (!table) {
      throw new Error(`Unknown table extent ${lastZ}`);
    }
    extent.value = table;
  }, maxZ);
}

test("Shift+arrows extend and contract from the moving endpoint", async ({ page }) => {
  await page.goto("/?screens=1&ea");
  const grid = page.getByText("Periodic table, hydrogen to krypton", { exact: true });
  await grid.focus();
  for (let lastZ = 4; lastZ <= 10; lastZ++) {
    await page.keyboard.press("Shift+ArrowRight");
    expect(await selection(page)).toEqual(Array.from({ length: lastZ - 2 }, (_, i) => i + 3));
  }
  for (let lastZ = 9; lastZ >= 3; lastZ--) {
    await page.keyboard.press("Shift+ArrowLeft");
    expect(await selection(page)).toEqual(Array.from({ length: lastZ - 2 }, (_, i) => i + 3));
  }
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  expect(await selection(page)).toEqual([4]);
  await page.getByRole("button", { name: "Reset All", exact: true }).press("Enter");
  await grid.focus();
  await page.keyboard.press("Shift+ArrowDown");
  expect(await selection(page)).toEqual([3, 11]);
  await page.keyboard.press("Shift+ArrowDown");
  expect(await selection(page)).toEqual([3, 11, 19]);
  await page.keyboard.press("Shift+ArrowUp");
  expect(await selection(page)).toEqual([3, 11]);
});

test("pointer selections and extent changes start a fresh keyboard extension", async ({ page }) => {
  await page.goto("/?screens=1&ea");
  const grid = page.getByText("Periodic table, hydrogen to krypton", { exact: true });
  await grid.focus();
  await page.keyboard.press("Shift+ArrowRight");
  const point = await page.evaluate(() => {
    const phet = (window as unknown as SimulationWindow<TrendsModel>).phet;
    const view = phet.joist.sim.selectedScreenProperty.value.view;
    const table = view.children
      .flatMap((node) => node.children)
      .find((node) => node.constructor.name === "PeriodicTableNode");
    // Chlorine: row 3, column 17 in the 36 × 40 table with a 16 px header.
    const position = table!.localToGlobalPoint(new phet.dot.Vector2(16 + 16.5 * 36, 16 + 2.5 * 40));
    return { x: position.x, y: position.y };
  });
  await page.mouse.click(point.x, point.y);
  expect(await selection(page)).toEqual([17]);
  await grid.focus();
  await page.keyboard.press("Shift+ArrowLeft");
  expect(await selection(page)).toEqual([16, 17]);
  await page.keyboard.press("Shift+ArrowLeft");
  expect(await selection(page)).toEqual([15, 16, 17]);

  await setExtent(page, 86);
  await page.evaluate(() => {
    const model = (window as unknown as SimulationWindow<TrendsModel>).phet.joist.sim.selectedScreenProperty.value
      .model;
    model.select({ kind: "single", zs: [57], anchorZ: 57 });
  });
  await grid.focus();
  await page.keyboard.press("Shift+ArrowRight");
  expect(await selection(page)).toEqual([57, 58]);
  await setExtent(page, 36);
  await grid.focus();
  await page.keyboard.press("Shift+ArrowDown");
  expect(await selection(page)).toEqual([3, 11]);
});

for (const { z, groups } of [
  { z: 17, groups: ["1s", "2sp", "3sp"] },
  { z: 46, groups: ["1s", "2sp", "3sp", "3d", "4sp", "4d"] },
  { z: 86, groups: ["1s", "2sp", "3sp", "3d", "4sp", "4d", "4f", "5sp", "5d", "6sp"] },
]) {
  test(`each occupied ring of Z=${z} selects its own electron group`, async ({ page }) => {
    await page.goto("/?screens=2&ea&maxZ=86");
    await page.getByRole("radio").first().waitFor();
    const points = await page.evaluate((atomicNumber) => {
      const phet = (window as unknown as SimulationWindow<ShieldingModel>).phet;
      const screen = phet.joist.sim.selectedScreenProperty.value;
      screen.model.selectedElement.zProperty.value = atomicNumber;
      const atom = screen.view.children.find((node) => node.constructor.name === "ShellAtomNode");
      if (!atom) {
        throw new Error("Missing atom");
      }
      const rings = atom.children[0]!.children.filter((node) => node.cursor === "pointer") as Circle[];
      return rings.map((ring) => {
        const point = atom.localToGlobalPoint(new phet.dot.Vector2(ring.radius, 0));
        return { x: point.x, y: point.y };
      });
    }, z);
    expect(points).toHaveLength(groups.length);
    for (const input of [page.mouse, page.touchscreen]) {
      for (const [index, point] of points.entries()) {
        if (input === page.mouse) {
          await page.mouse.click(point.x, point.y);
        } else {
          await page.touchscreen.tap(point.x, point.y);
        }
        const target = await page.evaluate(
          () =>
            (window as unknown as SimulationWindow<ShieldingModel>).phet.joist.sim.selectedScreenProperty.value.model
              .targetGroupProperty.value,
        );
        expect(target).toBe(groups[index]);
      }
    }
  });
}

test("palladium defaults to 4d shielding and has a valence charge inside the chart range", async ({ page }) => {
  await page.goto("/?screens=2&ea&maxZ=54");
  await page.getByRole("radio").first().waitFor();
  const result = await page.evaluate(() => {
    const model = (window as unknown as SimulationWindow<ShieldingModel>).phet.joist.sim.selectedScreenProperty.value
      .model;
    model.selectedElement.zProperty.value = 46;
    return model.shieldingProperty.value;
  });
  expect(result.target).toBe("4d");
  expect(result.s).toBeCloseTo(39.15, 6);
  expect(result.zEff).toBeCloseTo(6.85, 6);
  expect(result.zEff).toBeLessThan(9);
});

test("changing the extent in Preferences keeps electron choices above the legend", async ({ page }) => {
  await page.goto("/?screens=2&ea");
  await page.getByRole("radio").first().waitFor();
  for (const name of [
    "Through radon (Z = 1–86, with the lanthanides)",
    "Through xenon (Z = 1–54)",
    "Through krypton (Z = 1–36)",
  ]) {
    await page.getByRole("button", { name: "Preferences", exact: true }).press("Enter");
    if ((await page.getByRole("tab", { name: "Simulation", exact: true }).getAttribute("tabindex")) !== "0") {
      await page.getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
    }
    await page.getByRole("radio", { name, exact: true }).press("Space");
    await page.keyboard.press("Escape");
    const gap = await page.evaluate(() => {
      const view = (window as unknown as SimulationWindow<ShieldingModel>).phet.joist.sim.selectedScreenProperty.value
        .view;
      const panels = view.children.filter((node) => node.constructor.name === "PeriodicTrendsPanel");
      const legend = view.children.find((node) => node.constructor.name === "ShieldingLegendNode");
      return legend!.top - panels[1]!.bottom;
    });
    expect(gap).toBeCloseTo(10, 6);
  }
});

test("Explain follows the visible anchor initially, after Shielding edits and after reset", async ({ page }) => {
  await page.goto("/?ea");
  const trends = page.getByRole("button", { name: "Trends Screen", exact: true });
  await trends.press("Enter");
  for (const reset of [false, false, true]) {
    if (reset) {
      await page.getByRole("button", { name: "Reset All", exact: true }).press("Enter");
    }
    await page
      .getByRole("button", { name: "Explain the selected element on the Shielding screen", exact: true })
      .press("Enter");
    const z = await page.evaluate(
      () =>
        (window as unknown as SimulationWindow<ShieldingModel>).phet.joist.sim.selectedScreenProperty.value.model
          .elementProperty.value.z,
    );
    expect(z).toBe(3);
    await page.getByRole("button", { name: "Next element", exact: true }).press("Enter");
    await trends.press("Enter");
  }
});

for (const { locale, prefix } of [
  { locale: "en", prefix: "All elements, H →" },
  { locale: "fr", prefix: "Tous les éléments, H →" },
  { locale: "es", prefix: "Todos los elementos, H →" },
]) {
  test(`overview title follows the table extent in ${locale}`, async ({ page }) => {
    await page.goto(`/?screens=1&ea&locale=${locale}`);
    await page.getByRole("radio").first().waitFor();
    await page.evaluate(() => {
      const model = (window as unknown as SimulationWindow<TrendsModel>).phet.joist.sim.selectedScreenProperty.value
        .model;
      model.select({ kind: "single", zs: [3], anchorZ: 3 });
    });
    for (const { maxZ, symbol } of [
      { maxZ: 36, symbol: "Kr" },
      { maxZ: 54, symbol: "Xe" },
      { maxZ: 86, symbol: "Rn" },
      { maxZ: 36, symbol: "Kr" },
    ]) {
      await setExtent(page, maxZ);
      const titles = await page.evaluate(() => {
        const view = (window as unknown as SimulationWindow<TrendsModel>).phet.joist.sim.selectedScreenProperty.value
          .view;
        const chart = view.children.find((node) => node.constructor.name === "TrendChartNode");
        return chart!.children[0]!.children.filter((node) => node.constructor.name === "RichText").map(
          (node) => (node as RichText).string,
        );
      });
      expect(titles).toContain(`${prefix} ${symbol}`);
    }
  });
}
