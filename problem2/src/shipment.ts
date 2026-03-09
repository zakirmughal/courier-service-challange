import { Package } from "../../shared/types";
import { IShipmentSelector } from "../../shared/interfaces";

// S — Single Responsibility: only responsible for selecting the best shipment subset
export class ShipmentSelector implements IShipmentSelector {
  /**
   * Finds the best subset of packages to load onto one vehicle.
   * Priority: 1) most packages  2) heaviest total  3) smallest max distance
   */
  findBest(packages: Package[], maxWeight: number): Package[] {
    const eligible = packages.filter((p) => p.weight <= maxWeight);
    if (eligible.length === 0) return [];

    // Pass 1: maximise count
    // Secondary sort by distance asc: for equal-weight packages, prefer the
    // closer one — this naturally satisfies priority 3 (smallest max distance)
    const byWeightAsc = [...eligible].sort(
      (a, b) => a.weight - b.weight || a.distance - b.distance,
    );
    
    const selected = new Set<Package>();
    let total = 0;

    for (const pkg of byWeightAsc) {
      if (total + pkg.weight <= maxWeight) {
        selected.add(pkg);
        total += pkg.weight;
      }
    }

    // Pass 2: maximise total weight by swapping light→heavy (count stays fixed)
    let improved = true;
    while (improved) {
      improved = false;

      const unselected = eligible
        .filter((p) => !selected.has(p))
        .sort((a, b) => b.weight - a.weight); // heaviest first

      const lightFirst = [...selected].sort((a, b) => a.weight - b.weight);

      for (const heavy of unselected) {
        for (const light of lightFirst) {
          if (heavy.weight <= light.weight) break; // no gain possible from here
          if (total - light.weight + heavy.weight <= maxWeight) {
            selected.delete(light);
            selected.add(heavy);
            total = total - light.weight + heavy.weight;
            improved = true;
            break;
          }
        }
        if (improved) break; // restart with updated sets
      }
    }

    return [...selected];
  }
}
