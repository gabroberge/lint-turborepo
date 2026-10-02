import type { SourceCode, Variable } from "@oxlint/plugins";

import type { IdentifierNode } from "./identifier-node";

/** The variable an identifier reference resolves to, or `null` for a global or unresolved name. */
export function resolveVariable(sourceCode: SourceCode, identifier: IdentifierNode): Variable | null {
	const scope = sourceCode.getScope(identifier);
	const reference = scope.references.find((candidate) => candidate.identifier === identifier);
	return reference?.resolved ?? null;
}
