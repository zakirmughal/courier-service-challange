import { Package } from "../../shared/types";
import { ICostCalculator, IShipmentSelector } from "../../shared/interfaces";
import { FleetConfig, DeliveryResult } from "./types";

// S — Single Responsibility: orchestrates delivery scheduling across vehicles
// D — Dependency Inversion: depends on abstractions (ICostCalculator, IShipmentSelector)
export function scheduleDeliveries(
  baseCost: number,
  packages: Package[],
  fleet: FleetConfig,
  calculator: ICostCalculator,
  selector: IShipmentSelector,
): DeliveryResult[] {
  return [];
}
