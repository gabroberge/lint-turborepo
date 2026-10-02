import { staticString } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function staticPathStrings(array: ESTree.ArrayExpression): string[] | null {
	const paths: string[] = [];

	for (const element of array.elements) {
		if (element === null || element.type === "SpreadElement") {
			return null;
		}

		const path = staticString(element);
		if (path === null) {
			return null;
		}

		paths.push(path);
	}

	if (paths.length === 0) {
		return null;
	}

	return paths;
}
