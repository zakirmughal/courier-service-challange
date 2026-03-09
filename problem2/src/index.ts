import * as readline from "readline";
import { parseInput } from "./parser";
import { scheduleDeliveries } from "./scheduler";
import { ShipmentSelector } from "./shipment";
import { CostCalculator } from "../../shared/calculator";
import { offerRegistry } from "../../shared/offers";
import { ValidationError } from "../../shared/errors";

// D — wire up concrete implementations once, at the composition root
const calculator = new CostCalculator(offerRegistry);
const selector   = new ShipmentSelector();

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];

  rl.on("line", (line) => lines.push(line));

  rl.on("close", () => {
    try {
      const { baseCost, packages, fleet } = parseInput(lines);
      const results = scheduleDeliveries(baseCost, packages, fleet, calculator, selector);

      for (const r of results) {
        console.log(`${r.id} ${r.discount} ${r.totalCost} ${r.estimatedDeliveryTime}`);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error(`Input error: ${err.message}`);
        process.exit(1);
      }
      throw err;
    }
  });
}

main();
