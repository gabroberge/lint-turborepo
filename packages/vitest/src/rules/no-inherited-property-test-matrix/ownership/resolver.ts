import type { ClassLikeDeclaration } from "typescript";
import { createSourceFile, ScriptTarget } from "typescript";

import { scriptKind } from "../source/script-kind";
import { candidateNames } from "./candidate-names";
import type { ClassOwnership } from "./leaf-ownership";
import { leafOwnership } from "./leaf-ownership";

export interface OwnershipResolver {
	ownership(localName: string): ClassOwnership | null;
	uniqueSubclass(): string | null;
}

/**
 * Resolve which class declares each instance property, following a chain of
 * classes that extend a named class through the current file and relative imports.
 *
 * Returns null when the declaring type cannot be determined: mixins, mapped
 * types, dynamic heritage, class decorators, subclass constructors or methods,
 * index signatures, computed names, or an import that is not a relative class
 * export.
 */
export function createOwnershipResolver(filename: string, text: string): OwnershipResolver {
	const source = createSourceFile(filename, text, ScriptTarget.Latest, true, scriptKind(filename));
	const leafCache = new Map<string, ClassOwnership | null>();
	const ancestorCache = new WeakMap<ClassLikeDeclaration, Map<string, string> | null>();

	function ownership(localName: string): ClassOwnership | null {
		const cached = leafCache.get(localName);
		if (cached !== undefined) {
			return cached;
		}

		const resolved = leafOwnership(source, localName, ancestorCache);
		leafCache.set(localName, resolved);
		return resolved;
	}

	return {
		ownership,
		uniqueSubclass() {
			const subclasses: string[] = [];
			for (const name of candidateNames(source)) {
				const resolved = ownership(name);
				if (resolved?.extends === true) {
					subclasses.push(name);
				}
			}

			const onlyName = subclasses[0];
			if (subclasses.length !== 1 || onlyName === undefined) {
				return null;
			}

			return onlyName;
		}
	};
}
