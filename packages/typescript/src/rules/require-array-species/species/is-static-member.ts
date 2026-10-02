import type { ESTree } from "@oxlint/plugins";

import { computedStaticKey } from "./computed-static-key";
import { isSymbolSpeciesKey } from "./is-symbol-species-key";

/**
 * True for a static computed `[Symbol.species]` class member. Instance
 * members and other computed keys do not count.
 */
export function isStaticSpeciesMember(node: ESTree.ClassElement): boolean {
	const key = computedStaticKey(node);
	if (key === null) {
		return false;
	}

	return isSymbolSpeciesKey(key);
}
