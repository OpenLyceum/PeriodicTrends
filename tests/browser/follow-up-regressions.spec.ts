import { expect, type Page, test } from "@playwright/test";
import type { EnumerationProperty } from "scenerystack/axon";
import type { localeProperty } from "scenerystack/joist";
import type { Node, RichText, Text } from "scenerystack/scenery";
import type { ScreenView } from "scenerystack/sim";
import type { TableExtent } from "../../src/common/model/TableExtent.js";
import type { ShieldingModel } from "../../src/shielding/model/ShieldingModel.js";
import type { TrendsModel } from "../../src/trends/model/TrendsModel.js";

type SimulationWindow = {
  phet: {
    joist: {
      localeProperty: typeof localeProperty;
      sim: { selectedScreenProperty: { value: { model: TrendsModel | ShieldingModel; view: ScreenView } } };
    };
  };
};

const locales = [
  {
    locale: "en",
    table: "Periodic table, hydrogen to ",
    picker: "Element picker, hydrogen to ",
    summary: "The play area has a periodic table from hydrogen to ",
    names: ["Krypton", "Xenon", "Radon"],
    sameShell: "n stays 2",
  },
  {
    locale: "fr",
    table: "Tableau périodique, de l'hydrogène au ",
    picker: "Sélecteur d'élément, de l'hydrogène au ",
    summary: "La zone de jeu contient un tableau périodique de l'hydrogène au ",
    names: ["Krypton", "Xénon", "Radon"],
    sameShell: "n reste 2",
  },
  {
    locale: "es",
    table: "Tabla periódica, del hidrógeno al ",
    picker: "Selector de elemento, del hidrógeno al ",
    summary: "El área de juego tiene una tabla periódica del hidrógeno al ",
    names: ["Kriptón", "Xenón", "Radón"],
    sameShell: "n sigue siendo 2",
  },
] as const;

async function ready(page: Page, screen: number, locale: string, maxZ = 86) {
  await page.goto(`/?screens=${screen}&ea&maxZ=${maxZ}&locale=${locale}`);
  await page.getByRole("radio").first().waitFor();
}

async function setExtent(page: Page, maxZ: number) {
  await page.evaluate((lastZ) => {
    const model = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model;
    const property = model.selectedElement.tableExtentProperty as EnumerationProperty<TableExtent>;
    property.value = (property.value.constructor as typeof TableExtent).enumeration.values.find(
      (value) => value.maxZ === lastZ,
    )!;
  }, maxZ);
}

function explanation(page: Page) {
  return page.evaluate(() => {
    const view = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.view;
    const panel = view.children.find((node) => node.constructor.name === "ExplanationNode")!;
    const texts: string[] = [];
    const visit = (node: Node) => {
      if (node.constructor.name === "RichText" || node.constructor.name === "Text") {
        texts.push((node as RichText | Text).string);
      }
      node.children.forEach(visit);
    };
    visit(panel);
    return texts.join("\n");
  });
}

for (const locale of locales) {
  test(`configuration exceptions and regular s/p runs have accurate explanations in ${locale.locale}`, async ({
    page,
  }) => {
    await ready(page, 1, locale.locale);
    const grid = page.getByText(`${locale.table}${locale.names[2]}`, { exact: true });
    for (const firstZ of [23, 46, 3]) {
      await page.evaluate(
        async ({ z, modulePath }) => {
          const { PeriodicProperty } = (await import(
            modulePath
          )) as typeof import("../../src/common/model/PeriodicProperty.js");
          const model = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value
            .model as TrendsModel;
          model.periodicPropertyProperty.value = PeriodicProperty.Z_EFF;
          model.select({ kind: "single", zs: [z], anchorZ: z });
        },
        { z: firstZ, modulePath: "/src/common/model/PeriodicProperty.ts" },
      );
      await grid.focus();
      await page.keyboard.press("Shift+ArrowRight");
      const text = await explanation(page);
      expect(text).toContain("Slater");
      if (firstZ === 23) {
        expect(text).toContain("3.30");
        expect(text).toContain("2.95");
        expect(text).not.toMatch(/rises|sube|augmente/);
      } else if (firstZ === 46) {
        expect(text).toContain("6.85");
        expect(text).toContain("3.70");
        expect(text).toContain("(4d) (n = 4)");
        expect(text).toContain("(5s, 5p) (n = 5)");
        expect(text).not.toMatch(/rises|sube|augmente|n stays|n reste|n sigue/);
      } else {
        expect(text).toContain(locale.sameShell);
      }
    }
  });

  for (const screen of [1, 2]) {
    test(`${locale.locale} screen ${screen} accessible range follows initial and live table extents`, async ({
      page,
    }) => {
      await ready(page, screen, locale.locale);
      for (const maxZ of [86, 36, 54, 86]) {
        await setExtent(page, maxZ);
        const name = locale.names[[36, 54, 86].indexOf(maxZ)];
        const label = `${screen === 1 ? locale.table : locale.picker}${name}`;
        const grid = page.getByText(label, { exact: true });
        await expect(grid).toHaveCount(1);
        await grid.focus();
        await expect(grid).toBeFocused();
        if (screen === 1) {
          expect(await page.locator("p").allTextContents()).toEqual(
            expect.arrayContaining([expect.stringContaining(`${locale.summary}${name}`)]),
          );
        }
      }
    });
  }
}

test("Spanish Slater columns stay inside their panel through locale, extent and target changes", async ({ page }) => {
  await ready(page, 2, "en", 36);
  for (const locale of ["es", "fr", "en", "es"] as const) {
    await page.evaluate((value) => {
      (window as unknown as SimulationWindow).phet.joist.localeProperty.value = value;
    }, locale);
    for (const maxZ of [36, 54, 86]) {
      await setExtent(page, maxZ);
      const results = await page.evaluate(() => {
        const screen = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value;
        const model = screen.model as ShieldingModel;
        const breakdown = screen.view.children.find((node) => node.constructor.name === "SlaterBreakdownNode")!;
        const target = screen.view.children.filter((node) => node.constructor.name === "PeriodicTrendsPanel")[1]!;
        const values = [];
        for (const z of [1, 17, model.selectedElement.tableExtentProperty.value.maxZ]) {
          model.selectedElement.zProperty.value = z;
          for (const group of [model.targetGroupProperty.value, "1s"] as const) {
            model.targetGroupProperty.value = group;
            values.push({ overlap: breakdown.right - target.left, width: breakdown.width });
          }
        }
        return values;
      });
      for (const result of results) {
        expect(result.overlap).toBeLessThanOrEqual(-10);
        expect(result.width).toBeLessThanOrEqual(305);
      }
    }
  }
});

test("actual Preferences extent changes update both accessible grids and the Trends summary", async ({ page }) => {
  for (const screen of [1, 2]) {
    await ready(page, screen, "en", 36);
    await page.getByRole("button", { name: "Preferences", exact: true }).press("Enter");
    await page.getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
    await page
      .getByRole("radio", { name: "Through radon (Z = 1–86, with the lanthanides)", exact: true })
      .press("Space");
    await page.keyboard.press("Escape");
    await expect(
      page.getByText(`${screen === 1 ? locales[0].table : locales[0].picker}Radon`, { exact: true }),
    ).toHaveCount(1);
    if (screen === 1) {
      expect(await page.locator("p").allTextContents()).toEqual(
        expect.arrayContaining([expect.stringContaining(`${locales[0].summary}Radon`)]),
      );
    }
  }
});

test("changing language refreshes the accessible endpoint name on both screens", async ({ page }) => {
  for (const screen of [1, 2]) {
    await ready(page, screen, "en", 54);
    for (const locale of [locales[2], locales[1], locales[0]]) {
      await page.evaluate((value) => {
        (window as unknown as SimulationWindow).phet.joist.localeProperty.value = value;
      }, locale.locale);
      await expect(
        page.getByText(`${screen === 1 ? locale.table : locale.picker}${locale.names[1]}`, { exact: true }),
      ).toHaveCount(1);
      if (screen === 1) {
        expect(await page.locator("p").allTextContents()).toEqual(
          expect.arrayContaining([expect.stringContaining(`${locale.summary}${locale.names[1]}`)]),
        );
      }
    }
  }
});

test("Shielding Reset All preserves the expanded range for native element selection", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page, 2, "en", 36);
  await page.getByRole("button", { name: "Preferences", exact: true }).press("Enter");
  await page.getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
  await page.getByRole("radio", { name: "Through radon (Z = 1–86, with the lanthanides)", exact: true }).press("Space");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset All", exact: true }).press("Enter");
  const picker = page.getByText("Element picker, hydrogen to Radon", { exact: true });
  await picker.focus();
  // Reset starts on Cl: down its group through Br and I to At, then right to Rn.
  for (const key of ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowRight"]) {
    await page.keyboard.press(key);
  }
  expect(
    await page.evaluate(() => {
      const shared = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model
        .selectedElement;
      return {
        z: shared.zProperty.value,
        range: shared.zProperty.range.max,
        maxZ: shared.tableExtentProperty.value.maxZ,
      };
    }),
  ).toEqual({ z: 86, range: 86, maxZ: 86 });
  expect(errors).toEqual([]);
});
