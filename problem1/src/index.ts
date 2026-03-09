import * as readline from "readline";
import { parseInput } from "./parser";
import { ValidationError } from "../../shared/errors";

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];

  rl.on("line", (line) => lines.push(line));

  rl.on("close", () => {
    try {
      const { baseCost, packages } = parseInput(lines);
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