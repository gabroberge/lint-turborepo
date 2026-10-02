import { graphReferenceReachable } from "./graph-reference-reachable";

/**
 * Strongly connected components computed naively: two vertices share a
 * component exactly when each reaches the other. Canonical form: members in
 * `nodes` order, components ordered by their first member's position in
 * `nodes`. A slow, obviously correct reference for graph specs.
 */
export function graphReferenceComponents<Node>(
	nodes: readonly Node[],
	successors: (node: Node) => Iterable<Node>
): Node[][] {
	const unique = [...new Set(nodes)];
	const reach = new Map(unique.map((node) => [node, graphReferenceReachable(node, unique, successors)]));
	const assigned = new Set<Node>();
	const components: Node[][] = [];
	for (const node of unique) {
		if (assigned.has(node)) {
			continue;
		}

		const component = unique.filter(
			(other) => reach.get(node)?.has(other) === true && reach.get(other)?.has(node) === true
		);
		for (const member of component) {
			assigned.add(member);
		}

		components.push(component);
	}

	return components;
}
