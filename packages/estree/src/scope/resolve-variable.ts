import type { Scope, SourceCode, Variable } from "@oxlint/plugins";

import type { IdentifierNode } from "./identifier-node";

/**
 * The variable an identifier reference resolves to, or `null` for a global or unresolved name.
 *
 * The reference is looked up in the identifier's scope and then in the enclosing ones: some
 * references are recorded outside the innermost scope around them (a class decorator belongs
 * to the scope around the class, although it lies inside the class node).
 */
export function resolveVariable(sourceCode: SourceCode, identifier: IdentifierNode): Variable | null {
	for (let scope: Scope | null = sourceCode.getScope(identifier); scope !== null; scope = scope.upper) {
		const reference = scope.references.find((candidate) => candidate.identifier === identifier);
		if (reference !== undefined) {
			return reference.resolved;
		}
	}

	return null;
}
