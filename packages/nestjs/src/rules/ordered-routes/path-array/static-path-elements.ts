import { staticString } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export interface PathElement {
	element: ESTree.Expression;
	path: string;
}

export function staticPathElements(array: ESTree.ArrayExpression): PathElement[] | null {
	const elements: PathElement[] = [];

	for (const element of array.elements) {
		if (element === null || element.type === "SpreadElement") {
			return null;
		}

		const path = staticString(element);
		if (path === null) {
			return null;
		}

		elements.push({ element, path });
	}

	return elements;
}
