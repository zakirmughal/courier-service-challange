import { Package, PackageResult } from "./types";

// D — Dependency Inversion: high-level modules depend on these abstractions, not concrete classes

export interface ICostCalculator {
  calculate(baseCost: number, packages: Package[]): PackageResult[];
}

export interface IShipmentSelector {
  findBest(packages: Package[], maxWeight: number): Package[];
}