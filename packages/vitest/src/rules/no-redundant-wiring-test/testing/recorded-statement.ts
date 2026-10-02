import type { ESTree } from "@oxlint/plugins";

import { statementCovering } from "./statement-covering";

export function recordedStatement(
	source: string | undefined,
	snippet: string | undefined
): ESTree.ExpressionStatement | null {
	if (source === undefined) {
		return null;
	}

	if (snippet === undefined) {
		return null;
	}

	return statementCovering(source, snippet);
}
