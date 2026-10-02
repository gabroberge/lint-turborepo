import type { SourceFile } from "typescript";

import { locateClass } from "../locate/locate-class";
import type { AncestorOwnershipCache } from "./ancestor-ownership";
import { heritageOf } from "./heritage";
import { leafProperties } from "./leaf-properties";
import { mergeHeritage } from "./merge-heritage";

export interface ClassOwnership {
	className: string;
	extends: boolean;
	properties: ReadonlyMap<string, string>;
}

/**
 * Which class declares each instance property of a local name, using the
 * subclass collection rules. A decorator, constructor, method, accessor, or
 * index on the leaf makes ownership unknown.
 */
export function leafOwnership(
	source: SourceFile,
	name: string,
	ancestorCache: AncestorOwnershipCache
): ClassOwnership | null {
	const visited = new Set<string>();
	const found = locateClass(source, name, visited);
	if (found === null) {
		return null;
	}

	const own = leafProperties(found.node);
	if (own === null) {
		return null;
	}

	const properties = mergeHeritage(found, own, visited, ancestorCache);
	if (properties === null) {
		return null;
	}

	return {
		className: found.displayName,
		extends: heritageOf(found.node).kind === "name",
		properties
	};
}
