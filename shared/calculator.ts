import { Package, PackageResult } from "./types";
import { ICostCalculator } from "./interfaces";
import { OfferRegistry } from "./offerRegistry";

// S — Single Responsibility: only calculates cost and discount
// D — Dependency Inversion: depends on OfferRegistry abstraction, not hardcoded OFFERS
export class CostCalculator implements ICostCalculator {
  constructor(private readonly registry: OfferRegistry) {}

  calculate(baseCost: number, packages: Package[]): PackageResult[] {
    return packages.map((pkg) => {
      const cost = baseCost + pkg.weight * 10 + pkg.distance * 5;
      const discount = this.discount(cost, pkg);
      return { id: pkg.id, discount, totalCost: Math.round((cost - discount) * 100) / 100 };
    });
  }

  private discount(cost: number, pkg: Package): number {
    const offer = this.registry.get(pkg.offerCode);
    if (!offer) return 0;
    const withinDistance = pkg.distance >= offer.minDistance && pkg.distance <= offer.maxDistance;
    const withinWeight   = pkg.weight   >= offer.minWeight   && pkg.weight   <= offer.maxWeight;
    return withinDistance && withinWeight ? Math.round(cost * offer.discount * 100) / 100 : 0;
  }
}

