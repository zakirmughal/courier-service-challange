import { Package } from "../../shared/types";
import { ICostCalculator, IShipmentSelector } from "../../shared/interfaces";
import { FleetConfig, DeliveryResult } from "./types";

// Work in integer hundredths to avoid floating-point accumulation errors.
// e.g.  2 * truncate(100/70) should be 2*1.42 = 2.84
const fromHundredths = (h: number): number => h / 100;

// S — Single Responsibility: orchestrates delivery scheduling across vehicles
// D — Dependency Inversion: depends on abstractions (ICostCalculator, IShipmentSelector)
export function scheduleDeliveries(
  baseCost: number,
  packages: Package[],
  fleet: FleetConfig,
  calculator: ICostCalculator,
  selector: IShipmentSelector,
): DeliveryResult[] {
  const { vehicleCount, maxSpeed, maxWeight } = fleet;

  // Calculate cost/discount for all packages up front
  const costResults = calculator.calculate(baseCost, packages);
  const costMap = new Map(costResults.map((r) => [r.id, r]));

  // Build result map preserving original order
  const resultMap = new Map<string, DeliveryResult>(
    packages.map((p) => [
      p.id,
      { ...costMap.get(p.id)!, estimatedDeliveryTime: 0 },
    ]),
  );

  // Track each vehicle's availability in integer hundredths (avoids FP drift)
  const vehicleAvailableHundredths = new Array<number>(vehicleCount).fill(0);

  let remaining = [...packages];

  while (remaining.length > 0) {
    // Pick the vehicle that becomes available earliest
    const earliestHundredths = Math.min(...vehicleAvailableHundredths);
    const vehicleIdx         = vehicleAvailableHundredths.indexOf(earliestHundredths);

    const shipment = selector.findBest(remaining, maxWeight);
    if (shipment.length === 0) break;

    const farthest          = Math.max(...shipment.map((p) => p.distance));
    const tripHundredths    = Math.floor((farthest / maxSpeed) * 100); // truncate

    // Assign delivery times for each package in the shipment
    for (const pkg of shipment) {
      const pkgHundredths = Math.floor((pkg.distance / maxSpeed) * 100); // truncate
      const deliveryHundredths = earliestHundredths + pkgHundredths;
      resultMap.get(pkg.id)!.estimatedDeliveryTime = fromHundredths(deliveryHundredths);
    }

    // Vehicle returns after going to (and from) the farthest drop-off
    vehicleAvailableHundredths[vehicleIdx] = earliestHundredths + 2 * tripHundredths;

    // Remove delivered packages
    const shipmentIds = new Set(shipment.map((p) => p.id));
    remaining = remaining.filter((p) => !shipmentIds.has(p.id));
  }

  // Return results in original package order
  return packages.map((p) => resultMap.get(p.id)!);
}
