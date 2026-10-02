/**
 * The vertices of `nodes` reachable from `start` (itself included) by edges
 * between vertices of `nodes`, computed naively by repeated expansion until
 * nothing changes. A slow, obviously correct reference for graph specs.
 */
export function graphReferenceReachable<Node>(
	start: Node,
	nodes: readonly Node[],
	successors: (node: Node) => Iterable<Node>
): Set<Node> {
	const vertices = new Set(nodes);
	const reached = new Set([start]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const node of [...reached]) {
			for (const successor of successors(node)) {
				if (vertices.has(successor) && !reached.has(successor)) {
					reached.add(successor);
					changed = true;
				}
			}
		}
	}

	return reached;
}
