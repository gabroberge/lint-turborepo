import { describe, expect, it } from "vitest";

import { graphAdjacency } from "../testing/graph-adjacency";
import { graphCanonicalComponents } from "../testing/graph-canonical-components";
import { graphRandomGraph } from "../testing/graph-random-graph";
import { graphReferenceComponents } from "../testing/graph-reference-components";
import { cyclicComponents } from "./cyclic-components";

const CHAIN_LENGTH = 10_000;
const SEEDS = Array.from({ length: 400 }, (_, index) => index + 1);

describe(cyclicComponents, () => {
	it("should return nothing for an empty graph", () => {
		expect.assertions(1);

		expect(cyclicComponents([], graphAdjacency({}).successors)).toStrictEqual([]);
	});

	it("should leave out a single node without a self-loop", () => {
		expect.assertions(1);

		expect(cyclicComponents(["a"], graphAdjacency({}).successors)).toStrictEqual([]);
	});

	it("should keep a single node with a self-loop", () => {
		expect.assertions(1);

		expect(cyclicComponents(["a"], graphAdjacency({ a: ["a", "a"] }).successors)).toStrictEqual([["a"]]);
	});

	it("should keep a two-node cycle", () => {
		expect.assertions(1);

		expect(cyclicComponents(["a", "b"], graphAdjacency({ a: ["b"], b: ["a"] }).successors)).toStrictEqual([
			["a", "b"]
		]);
	});

	it("should return nothing for a directed acyclic graph", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b", "c"], b: ["d"], c: ["d"], d: [] });

		expect(cyclicComponents(["a", "b", "c", "d"], successors)).toStrictEqual([]);
	});

	it("should keep cyclic components in reverse topological order", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b"], b: ["a", "c"], c: ["d"], d: ["e"], e: ["d", "f"], f: ["f"] });

		expect(cyclicComponents(["a", "b", "c", "d", "e", "f"], successors)).toStrictEqual([
			["f"],
			["d", "e"],
			["a", "b"]
		]);
	});

	it("should ignore a self-loop through a node not listed in nodes", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["x"], x: ["a"] });

		expect(cyclicComponents(["a"], successors)).toStrictEqual([]);
	});

	it("should return nothing for a long chain", () => {
		expect.assertions(1);

		const nodes = Array.from({ length: CHAIN_LENGTH }, (_, index) => index);

		expect(cyclicComponents(nodes, (node) => (node + 1 < CHAIN_LENGTH ? [node + 1] : []))).toStrictEqual([]);
	});

	describe("when compared with a naive reachability reference on random graphs", () => {
		it("should find the components of two or more nodes or with a self-loop", () => {
			expect.assertions(400);

			for (const seed of SEEDS) {
				const { nodes, successors } = graphRandomGraph(seed);
				const expected = graphReferenceComponents(nodes, successors).filter(
					(component) => component.length > 1 || component.some((node) => successors(node).includes(node))
				);

				expect(
					graphCanonicalComponents(nodes, cyclicComponents(nodes, successors)),
					`seed ${String(seed)}`
				).toStrictEqual(expected);
			}
		});
	});
});
