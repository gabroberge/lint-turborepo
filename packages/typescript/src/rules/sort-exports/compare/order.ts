import type { Group } from "../statement/with-export-from";
import { compare } from "./compare";

export function order(group: Group): Group {
	const [first, ...rest] = group.toSorted(compare);
	if (first === undefined) {
		throw new Error("order: sorted group is empty");
	}

	return [first, ...rest];
}
