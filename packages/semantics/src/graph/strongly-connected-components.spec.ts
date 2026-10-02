import { describe, expect, it } from "vitest";

import { graphAdjacency } from "../testing/graph-adjacency";
import { graphCanonicalComponents } from "../testing/graph-canonical-components";
import { graphRandomGraph } from "../testing/graph-random-graph";
import { graphReferenceComponents } from "../testing/graph-reference-components";
import { stronglyConnectedComponents } from "./strongly-connected-components";

const CHAIN_LENGTH = 10_000;
const SEEDS = Array.from({ length: 400 }, (_, index) => index + 1);

describe(stronglyConnectedComponents, () => {
	it("should return no components for an empty graph", () => {
		expect.assertions(1);

		expect(stronglyConnectedComponents([], graphAdjacency({}).successors)).toStrictEqual([]);
	});

	it("should return a single node as its own component", () => {
		expect.assertions(1);

		expect(stronglyConnectedComponents(["a"], graphAdjacency({}).successors)).toStrictEqual([["a"]]);
	});

	it("should return a self-loop as a component of one", () => {
		expect.assertions(1);

		expect(stronglyConnectedComponents(["a"], graphAdjacency({ a: ["a"] }).successors)).toStrictEqual([["a"]]);
	});

	it("should group a two-node cycle", () => {
		expect.assertions(1);

		expect(
			stronglyConnectedComponents(["a", "b"], graphAdjacency({ a: ["b"], b: ["a"] }).successors)
		).toStrictEqual([["a", "b"]]);
	});

	it("should merge nested cycles into one component in discovery order", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b"], b: ["c", "d"], c: ["a"], d: ["b"] });

		expect(stronglyConnectedComponents(["d", "c", "b", "a"], successors)).toStrictEqual([["d", "b", "c", "a"]]);
	});

	it("should start a component with the node the search entered it by", () => {
		expect.assertions(2);

		const { successors } = graphAdjacency({ a: ["b"], b: ["a"], c: ["b"] });

		expect(stronglyConnectedComponents(["c", "a", "b"], successors)).toStrictEqual([["b", "a"], ["c"]]);
		expect(stronglyConnectedComponents(["a", "b", "c"], successors)).toStrictEqual([["a", "b"], ["c"]]);
	});

	it("should list a directed acyclic graph in reverse topological order", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b", "c"], b: ["d"], c: ["d"], d: [] });

		expect(stronglyConnectedComponents(["a", "b", "c", "d"], successors)).toStrictEqual([
			["d"],
			["b"],
			["c"],
			["a"]
		]);
	});

	it("should place every component after the components it reaches", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b"], b: ["a", "c"], c: ["d"], d: ["c", "e"], e: [] });

		expect(stronglyConnectedComponents(["a", "b", "c", "d", "e"], successors)).toStrictEqual([
			["e"],
			["c", "d"],
			["a", "b"]
		]);
	});

	it("should order disconnected parts by their first node in nodes", () => {
		expect.assertions(2);

		const { successors } = graphAdjacency({ a: [], b: ["c"], c: ["b"] });

		expect(stronglyConnectedComponents(["a", "b", "c"], successors)).toStrictEqual([["a"], ["b", "c"]]);
		expect(stronglyConnectedComponents(["c", "a", "b"], successors)).toStrictEqual([["c", "b"], ["a"]]);
	});

	it("should ignore duplicate edges", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b", "b", "a", "c"], b: ["a", "a"], c: ["c", "c"] });

		expect(stronglyConnectedComponents(["a", "b", "c"], successors)).toStrictEqual([["c"], ["a", "b"]]);
	});

	it("should count a node listed twice once", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["b"], b: [] });

		expect(stronglyConnectedComponents(["a", "b", "a", "b"], successors)).toStrictEqual([["b"], ["a"]]);
	});

	it("should ignore successors that are not listed in nodes", () => {
		expect.assertions(2);

		const { calls, successors } = graphAdjacency({ a: ["x"], b: ["a"], x: ["b"] });

		expect(stronglyConnectedComponents(["a", "b"], successors)).toStrictEqual([["a"], ["b"]]);
		expect(calls.has("x")).toBe(false);
	});

	it("should ask for each node's successors exactly once", () => {
		expect.assertions(1);

		const { calls, successors } = graphAdjacency({ a: ["b", "c"], b: ["a", "c"], c: ["a", "b", "c"] });
		stronglyConnectedComponents(["a", "b", "c"], successors);

		expect([...calls.values()]).toStrictEqual([1, 1, 1]);
	});

	it("should compare nodes by identity", () => {
		expect.assertions(1);

		const first = { name: "first" };
		const twin = { name: "first" };
		const edges = new Map([
			[first, [twin]],
			[twin, [first]]
		]);

		expect(stronglyConnectedComponents([first, twin], (node) => edges.get(node) ?? [])).toStrictEqual([
			[first, twin]
		]);
	});

	it("should accept lazily generated successors", () => {
		expect.assertions(1);

		function* successors(node: number): Generator<number> {
			yield (node + 1) % 3;
		}

		expect(stronglyConnectedComponents([0, 1, 2, 3], successors)).toStrictEqual([[0, 1, 2], [3]]);
	});

	it("should return the same result for the same input", () => {
		expect.assertions(1);

		const { successors } = graphAdjacency({ a: ["c", "b"], b: ["d"], c: ["d", "a"], d: ["e"], e: ["d"] });
		const nodes = ["e", "a", "d", "c", "b"];

		expect(stronglyConnectedComponents(nodes, successors)).toStrictEqual(
			stronglyConnectedComponents(nodes, successors)
		);
	});

	it("should handle a long chain without overflowing the stack", () => {
		expect.assertions(3);

		const nodes = Array.from({ length: CHAIN_LENGTH }, (_, index) => index);
		const components = stronglyConnectedComponents(nodes, (node) => (node + 1 < CHAIN_LENGTH ? [node + 1] : []));

		expect(components).toHaveLength(CHAIN_LENGTH);
		expect(components[0]).toStrictEqual([CHAIN_LENGTH - 1]);
		expect(components.at(-1)).toStrictEqual([0]);
	});

	it("should handle a long cycle without overflowing the stack", () => {
		expect.assertions(1);

		const nodes = Array.from({ length: CHAIN_LENGTH }, (_, index) => index);

		expect(stronglyConnectedComponents(nodes, (node) => [(node + 1) % CHAIN_LENGTH])).toStrictEqual([nodes]);
	});

	describe("when compared with a naive reachability reference on random graphs", () => {
		it("should find the same components", () => {
			expect.assertions(400);

			for (const seed of SEEDS) {
				const { nodes, successors } = graphRandomGraph(seed);

				expect(
					graphCanonicalComponents(nodes, stronglyConnectedComponents(nodes, successors)),
					`seed ${String(seed)}`
				).toStrictEqual(graphReferenceComponents(nodes, successors));
			}
		});

		it("should order every edge between components backwards", () => {
			expect.assertions(400);

			for (const seed of SEEDS) {
				const { nodes, successors } = graphRandomGraph(seed);
				const position = new Map(
					stronglyConnectedComponents(nodes, successors).flatMap((component, index) =>
						component.map((node) => [node, index] as const)
					)
				);
				const forward = nodes.flatMap((node) =>
					successors(node)
						.filter((successor) => position.has(successor))
						.filter((successor) => (position.get(successor) ?? 0) > (position.get(node) ?? 0))
						.map((successor) => [node, successor])
				);

				expect(forward, `seed ${String(seed)}`).toStrictEqual([]);
			}
		});
	});
});
