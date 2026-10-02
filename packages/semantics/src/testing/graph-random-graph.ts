import { graphRandom } from "./graph-random";

/** A random directed graph over small integers. */
export interface GraphRandomGraph {
	/** Each vertex's successors, possibly with duplicates, self-loops and values outside `nodes`. */
	adjacency: ReadonlyMap<number, readonly number[]>;
	/** The vertices, `0` to `size - 1` in shuffled order. */
	nodes: readonly number[];
	successors: (node: number) => readonly number[];
}

/**
 * A reproducible random directed graph of 0 to 14 vertices. Edge density
 * varies per seed so that some graphs are sparse forests and others are
 * dense tangles; some edges repeat, some are self-loops and some lead to
 * values (negative or too large) that are not vertices.
 */
export function graphRandomGraph(seed: number): GraphRandomGraph {
	const random = graphRandom(seed);
	const size = Math.floor(random() * 15);
	const density = 0.03 + random() * 0.22;
	const nodes = Array.from({ length: size }, (_, index) => ({ index, weight: random() }))
		.toSorted((left, right) => left.weight - right.weight)
		.map(({ index }) => index);
	const adjacency = new Map<number, number[]>();
	for (const node of nodes) {
		const successors: number[] = [];
		for (let candidate = 0; candidate < size; candidate += 1) {
			if (random() < density) {
				successors.push(candidate);
			}
		}

		if (random() < 0.1) {
			successors.push(-1 - Math.floor(random() * 3));
		}

		if (random() < 0.1) {
			successors.push(size + Math.floor(random() * 3));
		}

		if (successors.length > 0 && random() < 0.2) {
			successors.push(successors[Math.floor(random() * successors.length)] ?? node);
		}

		adjacency.set(
			node,
			successors
				.map((successor) => ({ successor, weight: random() }))
				.toSorted((left, right) => left.weight - right.weight)
				.map(({ successor }) => successor)
		);
	}

	return { adjacency, nodes, successors: (node) => adjacency.get(node) ?? [] };
}
