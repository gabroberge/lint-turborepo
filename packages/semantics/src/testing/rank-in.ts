import type { Item } from "./item";

/** By rank, then by position in `list`, the way the rule breaks ties by source index. */
export function rankIn(list: readonly Item[]): (left: Item, right: Item) => number {
	return (left, right) => left.rank - right.rank || list.indexOf(left) - list.indexOf(right);
}
