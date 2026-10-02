import { describe, expect, it } from "vitest";

import { evaluateClass } from "./testing/evaluate-class";
import { lines } from "./testing/lines";
import { randomClass } from "./testing/random-class";
import { safeSort } from "./testing/safe-sort";

const SEEDS = Array.from({ length: 40 }, (_, index) => index + 1);

const MIXED = lines(
	"class A {",
	'\tzed = record("zed");',
	"\tmid = this.zed;",
	'\talpha = record("alpha");',
	"\tstatic zs = 1;",
	"\tbeta = () => this.mid;",
	"\tstatic {",
	'\t\trecord("block");',
	"\t}",
	"\tstatic as = 2;",
	"\tgamma = 3;",
	"}"
);

describe("safe alphabetical sort", () => {
	describe("applied to its own output", () => {
		it("should settle on the same order and source", () => {
			expect.assertions(3);

			const first = safeSort(MIXED);
			const second = safeSort(first.source);

			expect(first.source).not.toBe(MIXED);
			expect(second.order).toStrictEqual(first.order);
			expect(second.source).toBe(first.source);
		});

		it("should report the same withheld moves", () => {
			expect.assertions(2);

			const first = safeSort(MIXED);

			expect(first.blocked).not.toStrictEqual([]);
			expect(safeSort(first.source).blocked).toStrictEqual(first.blocked);
		});
	});

	describe("on seeded random classes", () => {
		it("should reorder most of them", () => {
			expect.assertions(1);

			expect(
				SEEDS.filter((seed) => safeSort(randomClass(seed)).source !== randomClass(seed)).length
			).toBeGreaterThan(SEEDS.length / 2);
		});

		it("should give the same result for the same input", () => {
			expect.assertions(1);

			expect(SEEDS.map((seed) => safeSort(randomClass(seed)))).toStrictEqual(
				SEEDS.map((seed) => safeSort(randomClass(seed)))
			);
		});

		it("should be idempotent", () => {
			expect.assertions(1);

			expect(
				SEEDS.filter((seed) => {
					const first = safeSort(randomClass(seed));
					const second = safeSort(first.source);
					return (
						second.source !== first.source ||
						JSON.stringify(second.blocked) !== JSON.stringify(first.blocked)
					);
				})
			).toStrictEqual([]);
		});

		it("should not change what the class observes", () => {
			expect.assertions(1);

			expect(
				SEEDS.filter((seed) => {
					const code = randomClass(seed);
					return (
						JSON.stringify(evaluateClass(safeSort(code).source, "A")) !==
						JSON.stringify(evaluateClass(code, "A"))
					);
				})
			).toStrictEqual([]);
		});
	});
});
