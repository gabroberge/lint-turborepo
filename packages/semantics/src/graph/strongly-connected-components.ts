/**
 * # Graph: strongly connected components
 *
 * Generic graph algorithms over arbitrary node values, compared by identity
 * (`SameValueZero`, as `Map` and `Set` do). A graph is given as a list of
 * nodes and a `successors` function; nothing here knows what the nodes mean.
 *
 * `successors` is called at most once per node and its iteration order is
 * part of the input: the same nodes in the same order with the same
 * successor order always produce the same output.
 */

interface Frame<Node> {
	node: Node;
	stackStart: number;
	state: NodeState;
	successors: Iterator<Node>;
}

interface NodeState {
	index: number;
	lowLink: number;
	onStack: boolean;
}

/**
 * The strongly connected components of the graph whose vertices are `nodes`,
 * by Tarjan's algorithm, run iteratively so that deep graphs (long chains)
 * cannot overflow the call stack.
 *
 * Vertices: only values listed in `nodes` belong to the graph. A successor
 * that is not listed is ignored, as is the edge leading to it; a value listed
 * more than once counts once, at its first position. Duplicate edges are
 * harmless.
 *
 * Every vertex appears in exactly one component, including vertices on no
 * cycle (as a component of one).
 *
 * Order of components: reverse topological order of the condensation. When
 * any edge leads from a vertex of component `A` to a vertex of a different
 * component `B`, `B` comes before `A` in the result; so each component comes
 * after every component it can reach, and dependencies come first.
 * Components with no path between them keep the order Tarjan's algorithm
 * completes them in: depth first from each unvisited vertex in `nodes`
 * order, following successors in iteration order.
 *
 * Order within a component: discovery order of that same depth-first search;
 * in particular the first vertex is the one the search entered the
 * component by.
 */
export function stronglyConnectedComponents<Node>(
	nodes: readonly Node[],
	successors: (node: Node) => Iterable<Node>
): Node[][] {
	const vertices = new Set(nodes);
	const states = new Map<Node, NodeState>();
	const stack: Node[] = [];
	const components: Node[][] = [];
	const frames: Frame<Node>[] = [];
	let counter = 0;

	const enter = (node: Node): NodeState => {
		const state = { index: counter, lowLink: counter, onStack: true };
		counter += 1;
		states.set(node, state);
		frames.push({ node, stackStart: stack.length, state, successors: successors(node)[Symbol.iterator]() });
		stack.push(node);
		return state;
	};

	for (const root of nodes) {
		if (states.has(root)) {
			continue;
		}

		enter(root);
		let frame = frames.at(-1);
		while (frame !== undefined) {
			const next = frame.successors.next();
			if (next.done === true) {
				frames.pop();
				const { stackStart, state } = frame;
				frame = frames.at(-1);
				if (frame !== undefined) {
					frame.state.lowLink = Math.min(frame.state.lowLink, state.lowLink);
				}

				if (state.lowLink === state.index) {
					const component = stack.splice(stackStart);
					for (const member of component) {
						const memberState = states.get(member);
						if (memberState !== undefined) {
							memberState.onStack = false;
						}
					}

					components.push(component);
				}

				continue;
			}

			const successor = next.value;
			if (!vertices.has(successor)) {
				continue;
			}

			const successorState = states.get(successor);
			if (successorState === undefined) {
				enter(successor);
				frame = frames.at(-1);
			} else if (successorState.onStack) {
				frame.state.lowLink = Math.min(frame.state.lowLink, successorState.index);
			}
		}
	}

	return components;
}
