import { scheduleDeliveries } from "../src/scheduler";
import { CostCalculator } from "../../shared/calculator";
import { ShipmentSelector } from "../src/shipment";
import { offerRegistry } from "../../shared/offers";
import { Package } from "../../shared/types";
import { FleetConfig } from "../src/types";

// D — Dependency Inversion: inject concrete implementations via interfaces
const calculator = new CostCalculator(offerRegistry);
const selector   = new ShipmentSelector();

const pkg = (id: string, weight: number, distance: number, offerCode = ""): Package => ({
  id, weight, distance, offerCode,
});

// ─── Sample input (spec) ───────────────────────────────────────────────────────

describe("scheduleDeliveries — sample input (spec)", () => {
  const packages: Package[] = [
    pkg("PKG1", 50,  30,  "OFR001"),
    pkg("PKG2", 75,  125, "OFR008"),
    pkg("PKG3", 175, 100, "OFR003"),
    pkg("PKG4", 110, 60,  "OFR002"),
    pkg("PKG5", 155, 95,  "NA"),
  ];
  const fleet: FleetConfig = { vehicleCount: 2, maxSpeed: 70, maxWeight: 200 };
  const results = scheduleDeliveries(100, packages, fleet, calculator, selector);

  test("PKG1: discount=0, cost=750, time=3.98", () => {
    const r = results.find((x) => x.id === "PKG1")!;
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(750);
    expect(r.estimatedDeliveryTime).toBe(3.98);
  });

  test("PKG2: discount=0, cost=1475, time=1.78", () => {
    const r = results.find((x) => x.id === "PKG2")!;
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(1475);
    expect(r.estimatedDeliveryTime).toBe(1.78);
  });

  test("PKG3: discount=0, cost=2350, time=1.42", () => {
    const r = results.find((x) => x.id === "PKG3")!;
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(2350);
    expect(r.estimatedDeliveryTime).toBe(1.42);
  });

  test("PKG4: discount=105, cost=1395, time=0.85", () => {
    const r = results.find((x) => x.id === "PKG4")!;
    expect(r.discount).toBe(105);
    expect(r.totalCost).toBe(1395);
    expect(r.estimatedDeliveryTime).toBe(0.85);
  });

  test("PKG5: discount=0, cost=2125, time=4.19", () => {
    const r = results.find((x) => x.id === "PKG5")!;
    expect(r.discount).toBe(0);
    expect(r.totalCost).toBe(2125);
    expect(r.estimatedDeliveryTime).toBe(4.19);
  });

  test("output preserves original package order", () => {
    expect(results.map((r) => r.id)).toEqual(["PKG1", "PKG2", "PKG3", "PKG4", "PKG5"]);
  });
});

// ─── Single vehicle ────────────────────────────────────────────────────────────

describe("scheduleDeliveries — single vehicle, single package", () => {
  test("delivers correctly with no waiting", () => {
    const results = scheduleDeliveries(0, [pkg("A", 50, 70)], { vehicleCount: 1, maxSpeed: 70, maxWeight: 200 }, calculator, selector);
    expect(results[0].estimatedDeliveryTime).toBe(1.0);
  });
});

describe("scheduleDeliveries — single vehicle, multiple trips", () => {
  test("second batch waits for vehicle return", () => {
    // A+B=100kg fit. C=160kg alone (A+C and B+C both exceed 200)
    // Trip 1: A+B, max dist=70 → return at 2*1.0=2.0
    // Trip 2: C at 2.0 + 35/70=0.5 → 2.5
    const packages = [pkg("A", 50, 70), pkg("B", 50, 70), pkg("C", 160, 35)];
    const fleet: FleetConfig = { vehicleCount: 1, maxSpeed: 70, maxWeight: 200 };
    const results = scheduleDeliveries(0, packages, fleet, calculator, selector);

    expect(results.find((r) => r.id === "A")!.estimatedDeliveryTime).toBe(1.0);
    expect(results.find((r) => r.id === "B")!.estimatedDeliveryTime).toBe(1.0);
    expect(results.find((r) => r.id === "C")!.estimatedDeliveryTime).toBe(2.5);
  });
});

// ─── Multiple vehicles ─────────────────────────────────────────────────────────

describe("scheduleDeliveries — multiple vehicles", () => {
  test("second vehicle picks up next batch while first is returning", () => {
    const packages = [pkg("A", 50, 100), pkg("B", 50, 100), pkg("C", 150, 50)];
    const fleet: FleetConfig = { vehicleCount: 2, maxSpeed: 100, maxWeight: 200 };
    const results = scheduleDeliveries(0, packages, fleet, calculator, selector);

    expect(results.find((r) => r.id === "A")!.estimatedDeliveryTime).toBe(1.0);
    expect(results.find((r) => r.id === "B")!.estimatedDeliveryTime).toBe(1.0);
    expect(results.find((r) => r.id === "C")!.estimatedDeliveryTime).toBe(0.5);
  });

  test("earlier-returning vehicle is picked for next shipment", () => {
    // NEAR returns at 0.2, FAR returns at 1.8 — LAST goes on NEAR's vehicle
    const packages = [pkg("NEAR", 100, 10), pkg("FAR", 100, 90), pkg("LAST", 50, 50)];
    const fleet: FleetConfig = { vehicleCount: 2, maxSpeed: 100, maxWeight: 100 };
    const results = scheduleDeliveries(0, packages, fleet, calculator, selector);

    expect(results.find((r) => r.id === "LAST")!.estimatedDeliveryTime).toBe(0.7);
  });
});

// ─── Truncation ────────────────────────────────────────────────────────────────

describe("scheduleDeliveries — truncation (not rounding)", () => {
  test("3.457... truncates to 3.45, not 3.46", () => {
    const results = scheduleDeliveries(0, [pkg("X", 10, 242)], { vehicleCount: 1, maxSpeed: 70, maxWeight: 200 }, calculator, selector);
    expect(results[0].estimatedDeliveryTime).toBe(3.45);
  });

  test("accumulated time also truncated correctly", () => {
    // Vehicle return = 2 * truncate(100/70) = 2 * 1.42 = 2.84
    // B: 2.84 + 95/70 = 2.84 + 1.357... = 4.197... → 4.19
    const packages = [pkg("A", 175, 100), pkg("B", 155, 95)];
    const fleet: FleetConfig = { vehicleCount: 1, maxSpeed: 70, maxWeight: 200 };
    const results = scheduleDeliveries(0, packages, fleet, calculator, selector);

    expect(results.find((r) => r.id === "A")!.estimatedDeliveryTime).toBe(1.42);
    expect(results.find((r) => r.id === "B")!.estimatedDeliveryTime).toBe(4.19);
  });
});

// ─── Discount flows through ────────────────────────────────────────────────────

describe("scheduleDeliveries — discount applied correctly", () => {
  test("OFR003 discount reflected in output", () => {
    const results = scheduleDeliveries(100, [pkg("P", 10, 100, "OFR003")], { vehicleCount: 1, maxSpeed: 100, maxWeight: 200 }, calculator, selector);
    expect(results[0].discount).toBe(35);
    expect(results[0].totalCost).toBe(665);
  });
});
