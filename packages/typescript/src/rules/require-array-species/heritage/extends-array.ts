import { identifierName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { unwrapArrayHeritage } from "./unwrap-array-heritage";

/**
 * True when the heritage expression is a direct `Array` identifier, including
 * `Array<T>`. Member accesses such as `globalThis.Array` are ignored.
 */
export function extendsArray(superClass: ESTree.Expression | null): boolean {
	if (superClass === null) {
		return false;
	}

	return identifierName(unwrapArrayHeritage(superClass)) === "Array";
}
