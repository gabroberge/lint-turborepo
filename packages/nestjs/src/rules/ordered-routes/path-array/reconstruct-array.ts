import { endOf, startOf } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { PathElement } from "./static-path-elements";

export function reconstructArray(
	fileText: string,
	array: ESTree.ArrayExpression,
	original: readonly PathElement[],
	sorted: readonly PathElement[]
): string {
	const first = original[0];
	const second = original[1];
	const last = original.at(-1);
	if (first === undefined || second === undefined || last === undefined) {
		throw new Error("reconstructArray: expected at least two path elements");
	}

	const separator = fileText.slice(endOf(first.element), startOf(second.element));
	const inner = sorted.map((entry) => fileText.slice(startOf(entry.element), endOf(entry.element))).join(separator);

	return (
		fileText.slice(startOf(array), startOf(first.element)) +
		inner +
		fileText.slice(endOf(last.element), endOf(array))
	);
}
