/**
 * A topological order of `items` (given in source order), where
 * `precedes(earlier, later)` pins a pair to its source order. Among the
 * items free to go next, the preferred one goes first, so an item only
 * leaves its preferred place as far as a constraint forces it. Pinned pairs
 * keep their relative order, so with a symmetric relation (as conflicts
 * are) the result is a fixed point: running it again on its own output
 * returns the same order.
 */
export function constrainedOrder<Item>(
	items: readonly Item[],
	compare: (left: Item, right: Item) => number,
	precedes: (earlier: Item, later: Item) => boolean
): Item[] {
	const successors = new Map<Item, Item[]>(items.map((item) => [item, []]));
	const blockers = new Map<Item, number>(items.map((item) => [item, 0]));
	for (const [index, later] of items.entries()) {
		for (const earlier of items.slice(0, index)) {
			if (precedes(earlier, later)) {
				successors.get(earlier)?.push(later);
				blockers.set(later, (blockers.get(later) ?? 0) + 1);
			}
		}
	}

	const ready = items.filter((item) => blockers.get(item) === 0);
	const order: Item[] = [];
	while (ready.length > 0) {
		const next = ready.reduce((best, candidate) => (compare(candidate, best) < 0 ? candidate : best));
		ready.splice(ready.indexOf(next), 1);
		order.push(next);
		for (const successor of successors.get(next) ?? []) {
			const remaining = (blockers.get(successor) ?? 0) - 1;
			blockers.set(successor, remaining);
			if (remaining === 0) {
				ready.push(successor);
			}
		}
	}

	return order;
}
