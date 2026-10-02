import { endOf, startOf } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { pathArrayArgument } from "./path-array-argument";
import { reconstructArray } from "./reconstruct-array";
import { sortPathElements } from "./sort-path-elements";
import { staticPathElements } from "./static-path-elements";

export type PathArrayRewrite = { kind: "blocked" } | { kind: "sorted"; range: [number, number]; replacement: string };

export function pathArrayRewrite(
	decorator: ESTree.Decorator,
	fileText: string,
	sourceCode: SourceCode
): PathArrayRewrite | null {
	const array = pathArrayArgument(decorator);
	if (array === null) {
		return null;
	}

	const elements = staticPathElements(array);
	if (elements === null || elements.length < 2) {
		return null;
	}

	const sorted = sortPathElements(elements);
	if (sorted.every((entry, index) => entry.element === elements[index]?.element)) {
		return null;
	}

	if (sourceCode.getCommentsInside(array).length > 0) {
		return { kind: "blocked" };
	}

	return {
		kind: "sorted",
		range: [startOf(array), endOf(array)],
		replacement: reconstructArray(fileText, array, elements, sorted)
	};
}
