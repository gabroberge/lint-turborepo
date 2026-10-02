import type { Path } from "./path";

/**
 * # Graph: reachability with shortest paths
 *
 * Every node reachable from `start`, each with a shortest path to it: the
 * fewest edges, as listed edge values from `start` onward. `start` itself is
 * included with the empty path, so the result is never empty.
 *
 * The graph is explored breadth first and lazily: `edges` is called once for
 * each reachable node, and `target` once for each edge it yields, so the
 * graph may be infinite in extent as long as the reachable part is finite.
 * Cycles, self-loops and duplicate edges terminate: a node is assigned a path
 * the first time it is reached and never revisited.
 *
 * Determinism: among several shortest paths, the one found first wins, where
 * nodes are expanded in breadth-first order and each node's edges in their
 * iteration order. The returned map iterates in that same discovery order
 * (by non-decreasing path length), starting with `start`.
 *
 * Nodes are compared by identity (`SameValueZero`, as `Map` does).
 */
export function reachableFrom<Node, Edge>(
	start: Node,
	edges: (node: Node) => Iterable<Edge>,
	target: (edge: Edge) => Node
): Map<Node, Path<Edge>> {
	const paths = new Map<Node, Path<Edge>>([[start, []]]);
	const queue: [Node, Path<Edge>][] = [[start, []]];
	// Iterating an array also visits the elements pushed while iterating.
	for (const [node, path] of queue) {
		for (const edge of edges(node)) {
			const next = target(edge);
			if (!paths.has(next)) {
				const nextPath = [...path, edge];
				paths.set(next, nextPath);
				queue.push([next, nextPath]);
			}
		}
	}

	return paths;
}
