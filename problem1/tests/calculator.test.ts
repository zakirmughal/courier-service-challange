import { processPackages } from "../../shared/calculator";
import { Package } from "../../shared/types";

describe("processPackages — sample input", () => {
  const base = 100;

  test("PKG1: OFR001 not applicable (weight 5 < 70)", () => {
    const pkgs: Package[] = [{ id: "PKG1", weight: 5, distance: 5, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(175); // 100 + 50 + 25
  });

  test("PKG2: OFR002 not applicable (weight 15 < 100)", () => {
    const pkgs: Package[] = [{ id: "PKG2", weight: 15, distance: 5, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(275); // 100 + 150 + 25
  });

  test("PKG3: OFR003 applicable — 5% of 700", () => {
    const pkgs: Package[] = [{ id: "PKG3", weight: 10, distance: 100, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(35);
    expect(r.totalCost).toBe(665); // 700 - 35
  });
});

describe("processPackages — OFR001 boundaries (10%, dist < 200, weight 70–200)", () => {
  const base = 100;

  test("qualifies at exact lower boundary (weight=70, dist=0)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 70, distance: 0, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 70 * 10 + 0 * 5; // 800
    expect(r.discount).toBe(cost * 0.1);
    expect(r.totalCost).toBe(cost - cost * 0.1);
  });

  test("qualifies at exact upper boundary (weight=200, dist=199)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 200, distance: 199, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 200 * 10 + 199 * 5; // 3095
    expect(r.discount).toBe(Math.round(cost * 0.1 * 100) / 100);
  });

  test("fails when dist = 200 (rule is strictly < 200)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 100, distance: 200, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when weight = 69 (below min)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 69, distance: 100, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when weight = 201 (above max)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 201, distance: 100, offerCode: "OFR001" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });
});

describe("processPackages — OFR002 boundaries (7%, dist 50–150, weight 100–250)", () => {
  const base = 100;

  test("qualifies at exact boundaries (weight=100, dist=50)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 100, distance: 50, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 100 * 10 + 50 * 5; // 1350
    expect(r.discount).toBe(Math.round(cost * 0.07 * 100) / 100);
  });

  test("qualifies at exact boundaries (weight=250, dist=150)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 250, distance: 150, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 250 * 10 + 150 * 5; // 3350
    expect(r.discount).toBe(Math.round(cost * 0.07 * 100) / 100);
  });

  test("fails when dist = 49 (below min)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 150, distance: 49, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when dist = 151 (above max)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 150, distance: 151, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when weight = 99 (below min)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 99, distance: 100, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when weight = 251 (above max)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 251, distance: 100, offerCode: "OFR002" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });
});

describe("processPackages — OFR003 boundaries (5%, dist 50–250, weight 10–150)", () => {
  const base = 100;

  test("qualifies at exact boundaries (weight=10, dist=50)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 10, distance: 50, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 10 * 10 + 50 * 5; // 450
    expect(r.discount).toBe(Math.round(cost * 0.05 * 100) / 100);
  });

  test("qualifies at exact boundaries (weight=150, dist=250)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 150, distance: 250, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    const cost = 100 + 150 * 10 + 250 * 5; // 2850
    expect(r.discount).toBe(Math.round(cost * 0.05 * 100) / 100);
  });

  test("fails when weight = 9 (below min)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 9, distance: 100, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when weight = 151 (above max)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 151, distance: 100, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });

  test("fails when dist = 251 (above max)", () => {
    const pkgs: Package[] = [{ id: "P", weight: 100, distance: 251, offerCode: "OFR003" }];
    const [r] = processPackages(base, pkgs);
    expect(r.discount).toBe(0);
  });
});

describe("processPackages — general edge cases", () => {
  test("no offer code → no discount", () => {
    const pkgs: Package[] = [{ id: "P", weight: 10, distance: 100, offerCode: "" }];
    const [r] = processPackages(100, pkgs);
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(700);
  });

  test("unknown offer code → no discount", () => {
    const pkgs: Package[] = [{ id: "P", weight: 10, distance: 100, offerCode: "OFR999" }];
    const [r] = processPackages(100, pkgs);
    expect(r.discount).toBe(0);
  });

  test("zero base cost, weight, and distance → cost 0", () => {
    const pkgs: Package[] = [{ id: "P", weight: 0, distance: 0, offerCode: "" }];
    const [r] = processPackages(0, pkgs);
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(0);
  });

  test("multiple packages processed independently", () => {
    const pkgs: Package[] = [
      { id: "PKG1", weight: 5, distance: 5, offerCode: "OFR001" },
      { id: "PKG2", weight: 15, distance: 5, offerCode: "OFR002" },
      { id: "PKG3", weight: 10, distance: 100, offerCode: "OFR003" },
    ];
    const results = processPackages(100, pkgs);
    expect(results[0]).toMatchObject({ id: "PKG1", discount: 0, totalCost: 175 });
    expect(results[1]).toMatchObject({ id: "PKG2", discount: 0, totalCost: 275 });
    expect(results[2]).toMatchObject({ id: "PKG3", discount: 35, totalCost: 665 });
  });
});
