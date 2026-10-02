import { compareText } from "./compare-text";

export function compareNames(left: readonly string[], right: readonly string[]): number {
	const sortedLeft = left.toSorted(compareText);
	const sortedRight = right.toSorted(compareText);
	const limit = Math.min(sortedLeft.length, sortedRight.length);

	for (let index = 0; index < limit; index++) {
		const leftName = sortedLeft[index];
		const rightName = sortedRight[index];
		if (leftName === undefined || rightName === undefined) {
			throw new Error("compareNames: index out of range");
		}

		const result = compareText(leftName, rightName);
		if (result !== 0) {
			return result;
		}
	}

	return sortedLeft.length - sortedRight.length;
}
