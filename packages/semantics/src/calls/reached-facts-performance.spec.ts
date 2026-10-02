import { describe, expect, it } from "vitest";

import { unitInterference } from "../interference/unit-interference";
import { analyzeSource } from "../testing/analyze-source";
import { queryChainClass } from "../testing/query-chain-class";
import { reachedFacts } from "./reached-facts";

/**
 * Coarse bounds, far above the expected cost (about 0.1s and 0.2s on a
 * developer machine), so that only a return to the quadratic lookups
 * per access, which took several seconds, fails under a loaded CI runner.
 */
const REACHED_BUDGET_MS = 3000;
const INTERFERENCE_BUDGET_MS = 3000;

describe("query performance on a large class", () => {
	it("should reach the facts of every unit of a 400-unit call chain within the budget", { timeout: 60_000 }, () => {
		expect.assertions(2);

		const { model } = analyzeSource(queryChainClass(200));
		const started = performance.now();
		let total = 0;
		for (const unit of model.units.keys()) {
			total += reachedFacts(model, unit).length;
		}
		const elapsed = performance.now() - started;

		expect(total).toBe(80_400);
		expect(elapsed).toBeLessThan(REACHED_BUDGET_MS);
	});

	it("should compare 2500 pairs of units of a 400-unit call chain within the budget", { timeout: 60_000 }, () => {
		expect.assertions(2);

		const { model } = analyzeSource(queryChainClass(200));
		const units = [...model.units.keys()].slice(0, 50);
		const started = performance.now();
		let definite = 0;
		for (const first of units) {
			for (const second of units) {
				definite += unitInterference(model, first, second).kind === "definite" ? 1 : 0;
			}
		}
		const elapsed = performance.now() - started;

		expect(definite).toBeGreaterThan(0);
		expect(elapsed).toBeLessThan(INTERFERENCE_BUDGET_MS);
	});
});
