import type { Group } from "../statement/with-export-from";
import { compare } from "./compare";

export function isSorted(group: Group): boolean {
	const [first, ...rest] = group;
	let previous = first;

	for (const current of rest) {
		if (compare(previous, current) > 0) {
			return false;
		}

		previous = current;
	}

	return true;
}
