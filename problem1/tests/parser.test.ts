import { parseInput } from "../src/parser";
import { ValidationError } from "../../shared/errors";

describe("parseInput — valid input", () => {
  test("parses base cost and packages correctly", () => {
    const lines = ["100 3", "PKG1 5 5 OFR001", "PKG2 15 5 OFR002", "PKG3 10 100 OFR003"];
    const { baseCost, packages } = parseInput(lines);
    expect(baseCost).toBe(100);
    expect(packages).toHaveLength(3);
    expect(packages[0]).toEqual({ id: "PKG1", weight: 5, distance: 5, offerCode: "OFR001" });
    expect(packages[2]).toEqual({ id: "PKG3", weight: 10, distance: 100, offerCode: "OFR003" });
  });

  test("offer code is optional (defaults to empty string)", () => {
    const lines = ["100 1", "PKG1 5 5"];
    const { packages } = parseInput(lines);
    expect(packages[0].offerCode).toBe("");
  });

  test("offer code is normalised to uppercase", () => {
    const lines = ["100 1", "PKG1 5 5 ofr001"];
    const { packages } = parseInput(lines);
    expect(packages[0].offerCode).toBe("OFR001");
  });

  test("handles decimal weight and distance", () => {
    const lines = ["100 1", "PKG1 2.5 7.5 OFR001"];
    const { packages } = parseInput(lines);
    expect(packages[0].weight).toBe(2.5);
    expect(packages[0].distance).toBe(7.5);
  });

  test("handles single package", () => {
    const lines = ["50 1", "PKG1 10 50 OFR003"];
    const { baseCost, packages } = parseInput(lines);
    expect(baseCost).toBe(50);
    expect(packages).toHaveLength(1);
  });

  test("handles zero packages", () => {
    const { baseCost, packages } = parseInput(["100 0"]);
    expect(baseCost).toBe(100);
    expect(packages).toHaveLength(0);
  });

  test("handles zero base cost", () => {
    const { baseCost } = parseInput(["0 1", "PKG1 5 5"]);
    expect(baseCost).toBe(0);
  });
});

describe("parseInput — throws ValidationError on bad input", () => {
  const expectValidationError = (fn: () => void) => {
    expect(fn).toThrow(ValidationError);
  };

  test("missing package count on first line", () => {
    expectValidationError(() => parseInput(["100"]));
  });

  test("base cost is not a number", () => {
    expectValidationError(() => parseInput(["abc 1", "PKG1 5 5"]));
  });

  test("negative base cost", () => {
    expectValidationError(() => parseInput(["-1 1", "PKG1 5 5"]));
  });

  test("negative package count", () => {
    expectValidationError(() => parseInput(["-1 -1"]));
  });

  test("package line is missing", () => {
    expectValidationError(() => parseInput(["100 1"]));
  });

  test("package line has fewer than 3 fields", () => {
    expectValidationError(() => parseInput(["100 1", "PKG1 5"]));
  });

  test("weight is not a number", () => {
    expectValidationError(() => parseInput(["100 1", "PKG1 abc 5"]));
  });

  test("distance is not a number", () => {
    expectValidationError(() => parseInput(["100 1", "PKG1 5 abc"]));
  });

  test("negative weight", () => {
    expectValidationError(() => parseInput(["100 1", "PKG1 -5 10"]));
  });

  test("negative distance", () => {
    expectValidationError(() => parseInput(["100 1", "PKG1 5 -10"]));
  });
});
