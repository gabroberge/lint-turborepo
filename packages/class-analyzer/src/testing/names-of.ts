import type { Item } from "./item";

/** The names of `items`, in order. */
export function namesOf(items: readonly Item[]): string[] {
	return items.map(({ name }) => name);
}
