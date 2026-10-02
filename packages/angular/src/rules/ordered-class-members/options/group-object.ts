import type { GroupObject, GroupOption } from "./options";

/** A group option in its object form: a bare category or category list becomes `{ categories }`. */
export function groupObject(option: GroupOption): GroupObject {
	if (typeof option === "string" || Array.isArray(option)) {
		return { categories: option };
	}

	return option;
}
