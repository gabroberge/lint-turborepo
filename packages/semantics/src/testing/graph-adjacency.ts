/**
 * A `successors` function over string vertices from an adjacency record,
 * also counting how many times each vertex was asked for.
 */
export function graphAdjacency(edges: Readonly<Record<string, readonly string[]>>): {
	calls: Map<string, number>;
	successors: (node: string) => readonly string[];
} {
	const calls = new Map<string, number>();
	return {
		calls,
		successors: (node) => {
			calls.set(node, (calls.get(node) ?? 0) + 1);
			return Object.hasOwn(edges, node) ? (edges[node] ?? []) : [];
		}
	};
}
