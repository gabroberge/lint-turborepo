import { describe, expect, it } from "vitest";

import { failingSeeds } from "../testing/failing-seeds";
import { item } from "../testing/item";
import { namesOf } from "../testing/names-of";
import { orderedItems } from "../testing/ordered-items";
import { rankIn } from "../testing/rank-in";
import { relatedPairs } from "../testing/related-pairs";
import { constrainedOrder } from "./constrained-order";

describe(constrainedOrder, () => {
	it("should sort by preference without constraints", () => {
		expect.assertions(1);

		const items = [item("c", 2), item("a", 0), item("b", 1)];

		expect(namesOf(constrainedOrder(items, rankIn(items), () => false))).toStrictEqual(["a", "b", "c"]);
	});

	it("should keep a constrained pair in source order", () => {
		expect.assertions(1);

		const late = item("late", 1);
		const early = item("early", 0);

		expect(namesOf(orderedItems({ items: [late, early], related: relatedPairs([late, early]) }))).toStrictEqual([
			"late",
			"early"
		]);
	});

	it("should place a blocked member right after its blocker", () => {
		expect.assertions(1);

		const blocker = item("blocker", 2);
		const free = item("free", 1);
		const blocked = item("blocked", 0);
		const last = item("last", 3);

		expect(
			namesOf(orderedItems({ items: [blocker, free, blocked, last], related: relatedPairs([blocker, blocked]) }))
		).toStrictEqual(["free", "blocker", "blocked", "last"]);
	});

	it("should keep a chain in source order while unrelated members sort around it", () => {
		expect.assertions(1);

		const first = item("first", 3);
		const second = item("second", 2);
		const third = item("third", 1);
		const other = item("other", 0);

		expect(
			namesOf(
				orderedItems({
					items: [first, second, third, other],
					related: relatedPairs([first, second], [second, third])
				})
			)
		).toStrictEqual(["other", "first", "second", "third"]);
	});

	it("should return an empty order for no members", () => {
		expect.assertions(1);

		expect(
			constrainedOrder(
				[],
				() => 0,
				() => true
			)
		).toStrictEqual([]);
	});

	describe("with random members and constraints", () => {
		it("should return a permutation of the input", () => {
			expect.assertions(1);

			expect(
				failingSeeds((scenario, result) => {
					const expected = namesOf(scenario.items).toSorted();
					return namesOf(result).toSorted().join() === expected.join();
				})
			).toStrictEqual([]);
		});

		it("should respect every constrained pair", () => {
			expect.assertions(1);

			expect(
				failingSeeds(({ items, related }, result) =>
					items.every((earlier, index) =>
						items
							.slice(index + 1)
							.every(
								(later) => !related(earlier, later) || result.indexOf(earlier) < result.indexOf(later)
							)
					)
				)
			).toStrictEqual([]);
		});

		it("should equal a plain sort without constraints", () => {
			expect.assertions(1);

			expect(
				failingSeeds(({ items }) => {
					const unconstrained = constrainedOrder(items, rankIn(items), () => false);
					return namesOf(unconstrained).join() === namesOf(items.toSorted(rankIn(items))).join();
				})
			).toStrictEqual([]);
		});

		it("should be a fixed point", () => {
			expect.assertions(1);

			expect(
				failingSeeds(
					({ related }, result) =>
						namesOf(orderedItems({ items: result, related })).join() === namesOf(result).join()
				)
			).toStrictEqual([]);
		});

		it("should only invert neighbours that are constrained", () => {
			expect.assertions(1);

			expect(
				failingSeeds(({ items, related }, result) => {
					const compare = rankIn(items);
					return result.every((next, index) => {
						const previous = result[index - 1];
						return previous === undefined || compare(previous, next) < 0 || related(previous, next);
					});
				})
			).toStrictEqual([]);
		});
	});
});
