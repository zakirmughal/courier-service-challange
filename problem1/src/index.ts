import * as readline from "readline";
import { parseInput } from "./parser";
import { CostCalculator } from "../../shared/calculator";
import { offerRegistry } from "../../shared/offers";
import { ValidationError } from "../../shared/errors";

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];
  const calculator = new CostCalculator(offerRegistry);

  rl.on("line", (line) => lines.push(line));

  rl.on("close", () => {
    try {
      const { baseCost, packages } = parseInput(lines);
      const results = calculator.calculate(baseCost, packages);

      for (const result of results) {
        console.log(`${result.id} ${result.discount} ${result.totalCost}`);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error(`Input error: ${err.message}`);
        process.exit(1);
      }
      // Unexpected error — rethrow so it surfaces with a stack trace
      throw err;
    }
  });
}

main();