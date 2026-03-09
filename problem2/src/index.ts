import * as readline from "readline";
import { parseInput } from "./parser";
import { scheduleDeliveries } from "./scheduler";
import { ShipmentSelector } from "./shipment";
import { CostCalculator } from "../../shared/calculator";
import { offerRegistry } from "../../shared/offers";
import { ValidationError, UndeliverablePackageError } from "../../shared/errors";

// D — wire up concrete implementations once, at the composition root
const calculator = new CostCalculator(offerRegistry);
const selector   = new ShipmentSelector();

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];
  let totalLines = Infinity; // determined after first line is read

  rl.on("line", (line) => {
    lines.push(line);
    // First line: "baseCost numPackages" — now we know exactly how many lines we need
    // problem2 has one extra line at the end for fleet config
    if (lines.length === 1) {
      const numPackages = parseInt(line.trim().split(/\s+/)[1], 10);
      totalLines = isNaN(numPackages) ? Infinity : numPackages + 2;
    }
    if (lines.length >= totalLines) rl.close();
  });

  rl.on("close", () => {
    try {
      const { baseCost, packages, fleet } = parseInput(lines);
      const results = scheduleDeliveries(baseCost, packages, fleet, calculator, selector);

      for (const r of results) {
        console.log(`${r.id} ${r.discount} ${r.totalCost} ${r.estimatedDeliveryTime}`);
      }
    } catch (err) {
      if (err instanceof ValidationError || err instanceof UndeliverablePackageError) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
      throw err;
    }
  });
}

main();
