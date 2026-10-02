import type { ClassLikeDeclaration } from "typescript";

import type { Located } from "../locate/located";
import { ancestorProperties } from "./ancestor-properties";
import { mergeHeritage } from "./merge-heritage";

export type AncestorOwnershipCache = WeakMap<ClassLikeDeclaration, Map<string, string> | null>;

/**
 * Which ancestor declares each instance property, following a named `extends`
 * chain. Methods on an ancestor are allowed; an index or computed name is not.
 */
export function ancestorOwnership(
	current: Located,
	visited: Set<string>,
	ancestorCache: AncestorOwnershipCache
): Map<string, string> | null {
	const cached = ancestorCache.get(current.node);
	if (cached !== undefined) {
		return cached;
	}

	const own = ancestorProperties(current.node);
	if (own === null) {
		ancestorCache.set(current.node, null);
		return null;
	}

	const properties = mergeHeritage(current, own, visited, ancestorCache);
	ancestorCache.set(current.node, properties);
	return properties;
}
