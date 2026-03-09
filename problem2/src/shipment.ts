import { Package } from "../../shared/types";
import { IShipmentSelector } from "../../shared/interfaces";

// S — Single Responsibility: only responsible for selecting the best shipment subset
export class ShipmentSelector implements IShipmentSelector {
  /**
   * Finds the best subset of packages to load onto one vehicle.
   * Priority: 1) most packages  2) heaviest total  3) smallest max distance
   */
  findBest(packages: Package[], maxWeight: number): Package[] {
    return []
  }
}
