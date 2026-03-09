import { parseInput } from "../src/parser";
import { ValidationError } from "../../shared/errors";

const validInput = [
  "100 5",
  "PKG1 50 30 OFR001",
  "PKG2 75 125 OFR008",
  "PKG3 175 100 OFR003",
  "PKG4 110 60 OFR002",
  "PKG5 155 95 NA",
  "2 70 200",
];

// ─── Valid input ───────────────────────────────────────────────────────────────

describe("parseInput — valid input", () => {
  test("parses base cost correctly", () => {
    const { baseCost } = parseInput(validInput);
    expect(baseCost).toBe(100);
  });

  test("parses correct number of packages", () => {
    const { packages } = parseInput(validInput);
    expect(packages).toHaveLength(5);
  });

  test("parses first package correctly", () => {
    const { packages } = parseInput(validInput);
    expect(packages[0]).toEqual({ id: "PKG1", weight: 50, distance: 30, offerCode: "OFR001" });
  });

  test("parses last package correctly", () => {
    const { packages } = parseInput(validInput);
    expect(packages[4]).toEqual({ id: "PKG5", weight: 155, distance: 95, offerCode: "NA" });
  });

  test("parses fleet config correctly", () => {
    const { fleet } = parseInput(validInput);
    expect(fleet).toEqual({ vehicleCount: 2, maxSpeed: 70, maxWeight: 200 });
  });

  test("offer code is optional — defaults to empty string", () => {
    const { packages } = parseInput(["100 1", "PKG1 50 30", "1 70 200"]);
    expect(packages[0].offerCode).toBe("");
  });

  test("offer code is normalised to uppercase", () => {
    const { packages } = parseInput(["100 1", "PKG1 50 30 ofr001", "1 70 200"]);
    expect(packages[0].offerCode).toBe("OFR001");
  });

  test("handles zero packages", () => {
    const { packages } = parseInput(["100 0", "1 70 200"]);
    expect(packages).toHaveLength(0);
  });

  test("handles decimal weight and distance", () => {
    const { packages } = parseInput(["100 1", "PKG1 2.5 7.5", "1 70 200"]);
    expect(packages[0].weight).toBe(2.5);
    expect(packages[0].distance).toBe(7.5);
  });
});

// ─── Invalid package lines ─────────────────────────────────────────────────────

describe("parseInput — throws ValidationError on bad package input", () => {
  const err = (fn: () => void) => expect(fn).toThrow(ValidationError);

  test("missing package count on first line", () => {
    err(() => parseInput(["100", "1 70 200"]));
  });

  test("negative base cost", () => {
    err(() => parseInput(["-1 1", "PKG1 50 30", "1 70 200"]));
  });

  test("negative package count", () => {
    err(() => parseInput(["-100 -1", "1 70 200"]));
  });

  test("missing package line", () => {
    err(() => parseInput(["100 1", "1 70 200"]));
  });

  test("package line has fewer than 3 fields", () => {
    err(() => parseInput(["100 1", "PKG1 50", "1 70 200"]));
  });

  test("non-numeric weight", () => {
    err(() => parseInput(["100 1", "PKG1 abc 30", "1 70 200"]));
  });

  test("non-numeric distance", () => {
    err(() => parseInput(["100 1", "PKG1 50 abc", "1 70 200"]));
  });

  test("negative weight", () => {
    err(() => parseInput(["100 1", "PKG1 -5 30", "1 70 200"]));
  });

  test("negative distance", () => {
    err(() => parseInput(["100 1", "PKG1 50 -10", "1 70 200"]));
  });
});

// ─── Invalid fleet line ────────────────────────────────────────────────────────

describe("parseInput — throws ValidationError on bad fleet input", () => {
  const err = (fn: () => void) => expect(fn).toThrow(ValidationError);

  test("missing fleet line", () => {
    err(() => parseInput(validInput.slice(0, 6)));
  });

  test("fleet line has fewer than 3 fields", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 70"]));
  });

  test("zero vehicles", () => {
    err(() => parseInput([...validInput.slice(0, 6), "0 70 200"]));
  });

  test("negative vehicles", () => {
    err(() => parseInput([...validInput.slice(0, 6), "-1 70 200"]));
  });

  test("zero speed", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 0 200"]));
  });

  test("negative speed", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 -70 200"]));
  });

  test("zero max weight", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 70 0"]));
  });

  test("negative max weight", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 70 -200"]));
  });

  test("non-numeric vehicle count", () => {
    err(() => parseInput([...validInput.slice(0, 6), "abc 70 200"]));
  });

  test("non-numeric speed", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 abc 200"]));
  });

  test("non-numeric max weight", () => {
    err(() => parseInput([...validInput.slice(0, 6), "2 70 abc"]));
  });
});
