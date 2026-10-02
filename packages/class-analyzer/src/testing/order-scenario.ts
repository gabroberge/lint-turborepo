import type { Item } from "./item";

/** Items in source order, with the pairs that must keep that order. */
export interface OrderScenario {
	items: Item[];
	related: (left: Item, right: Item) => boolean;
}
