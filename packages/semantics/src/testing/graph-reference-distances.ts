/**
 * The fewest edges from `start` to every node reachable from it, computed
 * naively by relaxing every known node's edges until no distance improves.
 * A slow, obviously correct reference for graph specs.
 */
export function graphReferenceDistances<Node>(
	start: Node,
	successors: (node: Node) => Iterable<Node>
): Map<Node, number> {
	const distances = new Map([[start, 0]]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const [node, distance] of [...distances]) {
			for (const successor of successors(node)) {
				const known = distances.get(successor);
				if (known === undefined || known > distance + 1) {
					distances.set(successor, distance + 1);
					changed = true;
				}
			}
		}
	}

	return distances;
}
