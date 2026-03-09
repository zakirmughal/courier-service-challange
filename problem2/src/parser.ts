import { Package } from "../../shared/types";
import { ValidationError } from "../../shared/errors";
import { FleetConfig } from "./types";

export interface ParsedInput {
  baseCost: number;
  packages: Package[];
  fleet: FleetConfig;
}

function parsePackages(lines: string[], count: number): Package[] {
  const packages: Package[] = [];

  for (let i = 1; i <= count; i++) {
    const line = lines[i]?.trim();
    if (!line) throw new ValidationError(`Missing data for package ${i}`);

    const parts = line.split(/\s+/);
    if (parts.length < 3) throw new ValidationError(`Package line ${i} must have at least: pkg_id weight distance`);

    const [id, weightStr, distanceStr, offerCode = ""] = parts;
    const weight = parseFloat(weightStr);
    const distance = parseFloat(distanceStr);

    if (isNaN(weight))    throw new ValidationError(`Package "${id}": weight must be a valid number`);
    if (isNaN(distance))  throw new ValidationError(`Package "${id}": distance must be a valid number`);
    if (weight < 0)       throw new ValidationError(`Package "${id}": weight must be >= 0`);
    if (distance < 0)     throw new ValidationError(`Package "${id}": distance must be >= 0`);

    packages.push({ id, weight, distance, offerCode: offerCode.toUpperCase() });
  }

  return packages;
}

function parseFleet(line: string | undefined): FleetConfig {
  if (!line?.trim()) throw new ValidationError("Missing fleet line: no_of_vehicles max_speed max_carriable_weight");

  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) throw new ValidationError("Fleet line must have: no_of_vehicles max_speed max_carriable_weight");

  const vehicleCount = parseInt(parts[0], 10);
  const maxSpeed     = parseFloat(parts[1]);
  const maxWeight    = parseFloat(parts[2]);

  if (isNaN(vehicleCount) || isNaN(maxSpeed) || isNaN(maxWeight)) throw new ValidationError("Fleet values must be valid numbers");
  if (vehicleCount <= 0) throw new ValidationError("no_of_vehicles must be > 0");
  if (maxSpeed     <= 0) throw new ValidationError("max_speed must be > 0");
  if (maxWeight    <= 0) throw new ValidationError("max_carriable_weight must be > 0");

  return { vehicleCount, maxSpeed, maxWeight };
}

export function parseInput(lines: string[]): ParsedInput {
  const firstLine = lines[0]?.trim().split(/\s+/);
  if (!firstLine || firstLine.length < 2) throw new ValidationError("First line must have base_delivery_cost and no_of_packages");

  const baseCost = parseFloat(firstLine[0]);
  const count    = parseInt(firstLine[1], 10);

  if (isNaN(baseCost) || isNaN(count)) throw new ValidationError("base_delivery_cost and no_of_packages must be valid numbers");
  if (baseCost < 0) throw new ValidationError("base_delivery_cost must be >= 0");
  if (count    < 0) throw new ValidationError("no_of_packages must be >= 0");

  const packages = parsePackages(lines, count);
  const fleet    = parseFleet(lines[count + 1]);

  return { baseCost, packages, fleet };
}
