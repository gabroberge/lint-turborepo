import { stronglyConnectedComponents } from "./strongly-connected-components";

/**
 * # Graph: cyclic components
 *
 * The strongly connected components that contain a cycle: those of two or
 * more vertices, and single vertices with an edge to themselves.
 *
 * A cycle here is a structural fact about the graph given: some vertex can
 * reach itself by following edges. It says nothing about what happens when
 * code runs. In a call graph, a cycle means the calls may recurse, not that
 * they do, nor that they fail to terminate; in a dependency graph, it means
 * the dependencies are mutual, which is often fine. Whether a cycle is a
 * defect is for the query that asked to decide.
 *
 * Vertices, ordering and determinism are those of
 * `stronglyConnectedComponents`: components in reverse topological order of
 * the condensation, vertices in discovery order, successors not in `nodes`
 * ignored. To detect a self-loop, `successors` is called a second time for
 * each component of one vertex, so it must yield the same values each time.
 */
export function cyclicComponents<Node>(nodes: readonly Node[], successors: (node: Node) => Iterable<Node>): Node[][] {
	return stronglyConnectedComponents(nodes, successors).filter(
		([first, ...rest]) => rest.length > 0 || (first !== undefined && hasSelfLoop(first, successors))
	);
}

function hasSelfLoop<Node>(node: Node, successors: (node: Node) => Iterable<Node>): boolean {
	const self = new Set([node]);
	for (const successor of successors(node)) {
		if (self.has(successor)) {
			return true;
		}
	}

	return false;
}
