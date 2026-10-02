import { describe, expect, it } from "vitest";

import { graphRandomGraph } from "../testing/graph-random-graph";
import { graphReferenceDistances } from "../testing/graph-reference-distances";
import { reachableFrom } from "./reachable-from";

const CHAIN_LENGTH = 10_000;
const SEEDS = Array.from({ length: 400 }, (_, index) => index + 1);

interface Edge {
	label: string;
	to: string;
}

function edgesOf(graph: Readonly<Record<string, readonly string[]>>): {
	calls: string[];
	edges: (node: string) => Edge[];
} {
	const calls: string[] = [];
	return {
		calls,
		edges: (node) => {
			calls.push(node);
			return (Object.hasOwn(graph, node) ? (graph[node] ?? []) : []).map((to, index) => ({
				label: `${node}>${to}#${String(index)}`,
				to
			}));
		}
	};
}

function labelled(paths: Map<string, readonly Edge[]>): Record<string, string[]> {
	return Object.fromEntries([...paths].map(([node, path]) => [node, path.map(({ label }) => label)]));
}

const target = (edge: Edge): string => edge.to;

describe(reachableFrom, () => {
	it("should reach only the start, with an empty path, from an isolated node", () => {
		expect.assertions(1);

		expect(labelled(reachableFrom("a", edgesOf({}).edges, target))).toStrictEqual({ a: [] });
	});

	it("should keep the empty path for the start despite a self-loop", () => {
		expect.assertions(1);

		expect(labelled(reachableFrom("a", edgesOf({ a: ["a"] }).edges, target))).toStrictEqual({ a: [] });
	});

	it("should give the edges walked along a chain", () => {
		expect.assertions(1);

		expect(labelled(reachableFrom("a", edgesOf({ a: ["b"], b: ["c"] }).edges, target))).toStrictEqual({
			a: [],
			b: ["a>b#0"],
			c: ["a>b#0", "b>c#0"]
		});
	});

	it("should terminate on cycles", () => {
		expect.assertions(1);

		expect(
			labelled(reachableFrom("a", edgesOf({ a: ["b"], b: ["c", "a"], c: ["b"] }).edges, target))
		).toStrictEqual({ a: [], b: ["a>b#0"], c: ["a>b#0", "b>c#0"] });
	});

	it("should give a path with the fewest edges", () => {
		expect.assertions(1);

		const { edges } = edgesOf({ a: ["b", "d"], b: ["c"], c: ["d"] });

		expect(
			reachableFrom("a", edges, target)
				.get("d")
				?.map(({ label }) => label)
		).toStrictEqual(["a>d#1"]);
	});

	it("should prefer the shortest path found first", () => {
		expect.assertions(2);

		expect(
			reachableFrom("a", edgesOf({ a: ["b", "c"], b: ["d"], c: ["d"] }).edges, target)
				.get("d")
				?.map(({ label }) => label)
		).toStrictEqual(["a>b#0", "b>d#0"]);
		expect(
			reachableFrom("a", edgesOf({ a: ["c", "b"], b: ["d"], c: ["d"] }).edges, target)
				.get("d")
				?.map(({ label }) => label)
		).toStrictEqual(["a>c#0", "c>d#0"]);
	});

	it("should keep the first of duplicate edges", () => {
		expect.assertions(1);

		expect(labelled(reachableFrom("a", edgesOf({ a: ["b", "b"] }).edges, target))).toStrictEqual({
			a: [],
			b: ["a>b#0"]
		});
	});

	it("should iterate nodes in breadth-first discovery order", () => {
		expect.assertions(1);

		const { edges } = edgesOf({ a: ["c", "b"], b: ["e"], c: ["d"], d: ["f"] });

		expect([...reachableFrom("a", edges, target).keys()]).toStrictEqual(["a", "c", "b", "d", "e", "f"]);
	});

	it("should leave out unreachable nodes and never expand them", () => {
		expect.assertions(2);

		const { calls, edges } = edgesOf({ a: ["b"], b: [], x: ["a"] });

		expect([...reachableFrom("a", edges, target).keys()]).toStrictEqual(["a", "b"]);
		expect(calls).toStrictEqual(["a", "b"]);
	});

	it("should expand each reachable node once", () => {
		expect.assertions(1);

		const { calls, edges } = edgesOf({ a: ["b", "c", "a"], b: ["c", "a"], c: ["a", "b", "c"] });
		reachableFrom("a", edges, target);

		expect(calls).toStrictEqual(["a", "b", "c"]);
	});

	it("should return the same paths for the same input", () => {
		expect.assertions(1);

		const { edges } = edgesOf({ a: ["c", "b"], b: ["d", "e"], c: ["e", "d"], d: ["a"], e: ["b"] });

		expect(labelled(reachableFrom("a", edges, target))).toStrictEqual(labelled(reachableFrom("a", edges, target)));
	});

	it("should handle a long chain without overflowing the stack", () => {
		expect.assertions(2);

		const paths = reachableFrom(
			0,
			(node: number) => (node + 1 < CHAIN_LENGTH ? [node + 1] : []),
			(edge) => edge
		);

		expect(paths.size).toBe(CHAIN_LENGTH);
		expect(paths.get(CHAIN_LENGTH - 1)).toHaveLength(CHAIN_LENGTH - 1);
	});

	describe("when compared with naive shortest distances on random graphs", () => {
		it("should reach the same nodes by valid paths of the fewest edges", () => {
			expect.assertions(400);

			for (const seed of SEEDS) {
				const { nodes, successors } = graphRandomGraph(seed);
				const start = nodes[0] ?? 0;
				const paths = reachableFrom(
					start,
					(node: number) => successors(node).map((to) => [node, to] as const),
					([, to]) => to
				);
				const walked = [...paths].map(([node, path]) => ({
					connected: path.every(([from], index) => from === (index === 0 ? start : path[index - 1]?.[1])),
					distance: path.length,
					ends: (path.at(-1)?.[1] ?? start) === node,
					node
				}));
				const expected = [...graphReferenceDistances(start, successors)].map(([node, distance]) => ({
					connected: true,
					distance,
					ends: true,
					node
				}));

				expect(
					walked.toSorted((left, right) => left.node - right.node),
					`seed ${String(seed)}`
				).toStrictEqual(expected.toSorted((left, right) => left.node - right.node));
			}
		});
	});
});
