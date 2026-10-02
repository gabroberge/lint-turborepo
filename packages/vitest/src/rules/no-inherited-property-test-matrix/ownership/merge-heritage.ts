import { locateClass } from "../locate/locate-class";
import type { Located } from "../locate/located";
import type { AncestorOwnershipCache } from "./ancestor-ownership";
import { ancestorOwnership } from "./ancestor-ownership";
import { heritageOf } from "./heritage";

/**
 * Own properties overlaid on the parent chain. Uncertain heritage or an
 * unresolvable parent makes the whole map unknown.
 */
export function mergeHeritage(
	current: Located,
	own: Set<string>,
	visited: Set<string>,
	ancestorCache: AncestorOwnershipCache
): Map<string, string> | null {
	const heritage = heritageOf(current.node);
	if (heritage.kind === "uncertain") {
		return null;
	}

	const properties = new Map<string, string>();
	if (heritage.kind === "name") {
		const parent = locateClass(current.source, heritage.name, visited);
		if (parent === null) {
			return null;
		}

		const inherited = ancestorOwnership(parent, visited, ancestorCache);
		if (inherited === null) {
			return null;
		}

		for (const [property, owner] of inherited) {
			properties.set(property, owner);
		}
	}

	for (const property of own) {
		properties.set(property, current.displayName);
	}

	return properties;
}
