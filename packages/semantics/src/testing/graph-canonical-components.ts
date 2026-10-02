/**
 * Components rewritten in the canonical form `graphReferenceComponents`
 * returns: members in `nodes` order, components ordered by their first
 * member's position in `nodes`.
 */
export function graphCanonicalComponents<Node>(
	nodes: readonly Node[],
	components: readonly (readonly Node[])[]
): Node[][] {
	const position = new Map<Node, number>();
	for (const [index, node] of nodes.entries()) {
		if (!position.has(node)) {
			position.set(node, index);
		}
	}

	const rank = (node: Node | undefined): number =>
		node === undefined ? Number.POSITIVE_INFINITY : (position.get(node) ?? Number.POSITIVE_INFINITY);
	return components
		.map((component) => component.toSorted((left, right) => rank(left) - rank(right)))
		.toSorted((left, right) => rank(left[0]) - rank(right[0]));
}
