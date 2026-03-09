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
    const n = eligible.length;
    if (n === 0) return [];

    let best: Package[] = [];
    let bestCount    = -1;
    let bestWeight   = -1;
    let bestMaxDist  = Infinity;

    // Enumerate every non-empty subset using bitmask
    for (let mask = 1; mask < (1 << n); mask++) {
      const subset: Package[] = [];
      let totalWeight = 0;

      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          subset.push(eligible[i]);
          totalWeight += eligible[i].weight;
        }
      }

      if (totalWeight > maxWeight) continue;

      const count   = subset.length;
      const maxDist = Math.max(...subset.map((p) => p.distance));

      if (
        count > bestCount ||
        (count === bestCount && totalWeight > bestWeight) ||
        (count === bestCount && totalWeight === bestWeight && maxDist < bestMaxDist)
      ) {
        best        = subset;
        bestCount   = count;
        bestWeight  = totalWeight;
        bestMaxDist = maxDist;
      }
    }

    return best;
  }
}
