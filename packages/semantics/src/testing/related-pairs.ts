import type { Item } from "./item";

/** A relation holding exactly for the `linked` pairs, in either direction. */
export function relatedPairs(...linked: [Item, Item][]): (left: Item, right: Item) => boolean {
	return (left, right) =>
		linked.some(([first, second]) => (first === left && second === right) || (first === right && second === left));
}
