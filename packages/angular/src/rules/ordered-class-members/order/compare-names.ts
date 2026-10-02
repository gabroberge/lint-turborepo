/** Compares names case-insensitively, breaking an exact case-insensitive tie by code unit so the order is total. */
export function compareNames(left: string, right: string): number {
	const folded = left.toLowerCase().localeCompare(right.toLowerCase(), "en");
	if (folded !== 0) {
		return folded;
	}

	if (left === right) {
		return 0;
	}

	return left < right ? -1 : 1;
}
