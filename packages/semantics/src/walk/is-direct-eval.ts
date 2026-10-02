import { resolveVariable } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Walker } from "./walker";

/**
 * True for a direct `eval(...)` of the global `eval`. Its code runs in the
 * caller's scope, so it can read `this` and every binding the analysis sees.
 */
export function isDirectEval(walker: Walker, call: ESTree.CallExpression, callee: ESTree.Node): boolean {
	if (callee !== call.callee || callee.type !== "Identifier" || callee.name !== "eval") {
		return false;
	}

	// A global resolves to nothing, or to a declared global without definitions.
	const variable = resolveVariable(walker.draft.sourceCode, callee);
	return variable === null || variable.defs.length === 0;
}
