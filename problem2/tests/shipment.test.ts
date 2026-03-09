import { ShipmentSelector } from "../src/shipment";
import { IShipmentSelector } from "../../shared/interfaces";
import { Package } from "../../shared/types";

const pkg = (id: string, weight: number, distance: number): Package => ({
  id, weight, distance, offerCode: "",
});

// Verify ShipmentSelector satisfies the IShipmentSelector contract
const selector: IShipmentSelector = new ShipmentSelector();

describe("ShipmentSelector — sample input steps (maxWeight=200)", () => {
  const pkgs = [
    pkg("PKG1", 50, 30),
    pkg("PKG2", 75, 125),
    pkg("PKG3", 175, 100),
    pkg("PKG4", 110, 60),
    pkg("PKG5", 155, 95),
  ];

  test("step 1: picks PKG2+PKG4 (2 pkgs, heaviest at 185kg)", () => {
    const ids = selector.findBest(pkgs, 200).map((p) => p.id).sort();
    expect(ids).toEqual(["PKG2", "PKG4"]);
  });

  test("step 2: from PKG1/PKG3/PKG5 picks PKG3 (heaviest single at 175kg)", () => {
    const remaining = pkgs.filter((p) => p.id !== "PKG2" && p.id !== "PKG4");
    expect(selector.findBest(remaining, 200).map((p) => p.id)).toEqual(["PKG3"]);
  });

  test("step 3: from PKG1/PKG5 picks PKG5 (heaviest single at 155kg)", () => {
    const remaining = pkgs.filter((p) => ["PKG1", "PKG5"].includes(p.id));
    expect(selector.findBest(remaining, 200).map((p) => p.id)).toEqual(["PKG5"]);
  });

  test("step 4: single PKG1 remaining", () => {
    expect(selector.findBest([pkg("PKG1", 50, 30)], 200).map((p) => p.id)).toEqual(["PKG1"]);
  });
});


describe("ShipmentSelector — count priority", () => {
  test("prefers 2 light packages over 1 heavy", () => {
    const packages = [pkg("Heavy", 190, 10), pkg("L1", 50, 20), pkg("L2", 60, 30)];
    const ids = selector.findBest(packages, 200).map((p) => p.id).sort();
    expect(ids).toEqual(["L1", "L2"]);
  });

  test("prefers 3 packages over 2 when all fit", () => {
    const packages = [pkg("A", 50, 10), pkg("B", 50, 20), pkg("C", 50, 30)];
    const ids = selector.findBest(packages, 200).map((p) => p.id).sort();
    expect(ids).toEqual(["A", "B", "C"]);
  });
});

describe("ShipmentSelector — weight tiebreaker (same count)", () => {
  test("prefers heavier combo when count is equal", () => {
    // A+B=125kg, A+C=160kg, B+C=185kg — prefer B+C
    const packages = [pkg("A", 50, 10), pkg("B", 75, 20), pkg("C", 110, 30)];
    const ids = selector.findBest(packages, 200).map((p) => p.id).sort();
    expect(ids).toEqual(["B", "C"]);
  });
});

describe("ShipmentSelector — distance tiebreaker (same count & weight)", () => {
  test("prefers shipment with smaller max distance", () => {
    const packages = [pkg("A", 50, 200), pkg("B", 50, 100)];
    expect(selector.findBest(packages, 50)[0].id).toBe("B");
  });
});

describe("ShipmentSelector — weight boundaries", () => {
  test("includes package at exact maxWeight", () => {
    expect(selector.findBest([pkg("A", 200, 10)], 200).map((p) => p.id)).toEqual(["A"]);
  });

  test("excludes package 1kg over maxWeight", () => {
    const packages = [pkg("A", 201, 10), pkg("B", 50, 20)];
    expect(selector.findBest(packages, 200).map((p) => p.id)).toEqual(["B"]);
  });

  test("returns empty array when all packages exceed maxWeight", () => {
    expect(selector.findBest([pkg("A", 250, 10), pkg("B", 300, 20)], 200)).toEqual([]);
  });
});
