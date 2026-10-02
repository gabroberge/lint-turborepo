import { describe, expect, it } from "vitest";

import { analyzeSource } from "../testing/analyze-source";
import type { QueryField, QueryObservation } from "../testing/query-evaluate-class";
import { queryClassSource, queryEvaluateClass } from "../testing/query-evaluate-class";
import { queryRandomClass } from "../testing/query-random-class";
import { unitInterference } from "./unit-interference";

const SEEDS = Array.from({ length: 250 }, (_, index) => index + 1);

/**
 * True when swapping two adjacent fields changes what construction observes.
 * A field that throws in both orders stops the other one in one order only;
 * that difference comes from abrupt completion, which the model does not
 * describe, so it is not counted.
 */
function differs(pair: readonly string[], before: QueryObservation, after: QueryObservation): boolean {
	if (before.errorField !== null && before.errorField === after.errorField && pair.includes(before.errorField)) {
		return false;
	}

	return JSON.stringify(before) !== JSON.stringify(after);
}

function swapped(fields: readonly QueryField[], index: number): QueryField[] {
	const copy = [...fields];
	const [left, right] = [copy[index], copy[index + 1]];
	if (left !== undefined && right !== undefined) {
		copy[index] = right;
		copy[index + 1] = left;
	}

	return copy;
}

describe("unitInterference against evaluation", () => {
	describe("when two adjacent field initializers of a random class are swapped", () => {
		it("should never report none for a swap that changes the constructed instance", { timeout: 60_000 }, () => {
			expect.assertions(2);

			const missed: string[] = [];
			let observedDifferences = 0;
			for (const seed of SEEDS) {
				const { fields, rest } = queryRandomClass(seed);
				const { model, unit } = analyzeSource(queryClassSource(fields, rest));
				const before = queryEvaluateClass(fields, rest);
				for (let index = 0; index + 1 < fields.length; index += 1) {
					const pair = [fields[index]?.name ?? "", fields[index + 1]?.name ?? ""];
					if (differs(pair, before, queryEvaluateClass(swapped(fields, index), rest))) {
						observedDifferences += 1;
						const [first, second] = pair.map((name) => unit(`A.${name} (initializer)`).id);
						if (unitInterference(model, first ?? "", second ?? "").kind === "none") {
							missed.push(
								`seed ${String(seed)}: ${pair.join(" <> ")}\n${queryClassSource(fields, rest)}`
							);
						}
					}
				}
			}

			expect(missed).toStrictEqual([]);
			expect(observedDifferences).toBeGreaterThan(100);
		});
	});
});
