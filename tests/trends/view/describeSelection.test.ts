import { describe, expect, it } from "vitest";
import { PeriodicProperty } from "../../../src/common/model/PeriodicProperty.js";
import { TableExtent } from "../../../src/common/model/TableExtent.js";
import { periodSelection, type TrendSelection } from "../../../src/common/model/TrendSelection.js";
import { describeSelection } from "../../../src/trends/view/describeSelection.js";

function run(zs: number[]): TrendSelection {
  return { kind: "period", zs, anchorZ: zs[0]! };
}

describe("period explanation consistency", () => {
  it("retains the same-shell explanation for the regular period-2 s/p run", () => {
    const description = describeSelection(periodSelection(TableExtent.KRYPTON, 2), PeriodicProperty.Z_EFF, false);
    expect(description.paragraphs[0]).toContain("n stays 2");
    expect(description.paragraphs[0]).toContain("rises from 1.30 to 5.85");
    expect(description.paragraphs[0]).toContain("Slater's estimate");
  });

  it("describes the V-to-Cr reversal without claiming that charge rises", () => {
    const description = describeSelection(run([23, 24]), PeriodicProperty.Z_EFF, false);
    expect(description.paragraphs[0]).toContain("changes from 3.30 to 2.95");
    expect(description.paragraphs.join(" ")).not.toContain("rises");
    expect(description.paragraphs[1]).toContain("Changes in d/f occupation");
  });

  it("identifies both target groups and principal quantum numbers for Pd-to-Ag", () => {
    const description = describeSelection(run([46, 47]), PeriodicProperty.Z_EFF, false);
    expect(description.paragraphs[0]).toContain("changes from 6.85 to 3.70");
    expect(description.paragraphs[0]).toContain("(4d) (n = 4)");
    expect(description.paragraphs[0]).toContain("(5s, 5p) (n = 5)");
    expect(description.paragraphs.join(" ")).not.toContain("n stays");
    expect(description.paragraphs[1]).toContain("depend on the orbital");
  });

  it("detects configuration changes within a run even when its endpoints use the same shell", () => {
    const description = describeSelection(periodSelection(TableExtent.XENON, 5), PeriodicProperty.Z_EFF, false);
    expect(description.paragraphs.join(" ")).not.toContain("n stays");
    expect(description.paragraphs[1]).toContain("target electron");
  });

  it("qualifies the broad trend when selected experimental values reverse", () => {
    const description = describeSelection(run([46, 47]), PeriodicProperty.IONIZATION_ENERGY, true);
    expect(description.paragraphs[1]).toContain("generally rises");
    expect(description.paragraphs[1]).toContain("8.34 eV → 7.58 eV");
  });
});
