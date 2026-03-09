import { Package } from "../../shared/types";
import { ValidationError } from "../../shared/errors";

export function parseInput(lines: string[]): { baseCost: number; packages: Package[] } {
  const firstLine = lines[0]?.trim().split(/\s+/);
  if (!firstLine || firstLine.length < 2) {
    throw new ValidationError("First line must have base_delivery_cost and no_of_packages");
  }

  const baseCost = parseFloat(firstLine[0]);
  const count = parseInt(firstLine[1], 10);

  if (isNaN(baseCost) || isNaN(count)) {
    throw new ValidationError("base_delivery_cost and no_of_packages must be valid numbers");
  }
  if (baseCost < 0) {
    throw new ValidationError("base_delivery_cost must be >= 0");
  }
  if (count < 0) {
    throw new ValidationError("no_of_packages must be >= 0");
  }

  const packages: Package[] = [];

  for (let i = 1; i <= count; i++) {
    const line = lines[i]?.trim();
    if (!line) {
      throw new ValidationError(`Missing data for package ${i}`);
    }

    const parts = line.split(/\s+/);
    if (parts.length < 3) {
      throw new ValidationError(`Package line ${i} must have at least: pkg_id weight distance`);
    }

    const [id, weightStr, distanceStr, offerCode = ""] = parts;
    const weight = parseFloat(weightStr);
    const distance = parseFloat(distanceStr);

    if (isNaN(weight)) {
      throw new ValidationError(`Package "${id}": weight must be a valid number`);
    }
    if (isNaN(distance)) {
      throw new ValidationError(`Package "${id}": distance must be a valid number`);
    }
    if (weight < 0) {
      throw new ValidationError(`Package "${id}": weight must be >= 0`);
    }
    if (distance < 0) {
      throw new ValidationError(`Package "${id}": distance must be >= 0`);
    }

    packages.push({ id, weight, distance, offerCode: offerCode.toUpperCase() });
  }

  return { baseCost, packages };
}
