import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { importedName } from "./imported-name";
import { staticPropertyName } from "./static-property-name";

/**
 * The `@angular/core` function a callee refers to, such as `signal` or
 * `input.required`. Aliased and namespace imports resolve to their exported
 * names. A local function that merely shares a name returns `null`.
 */
export function angularApiOf(sourceCode: SourceCode, callee: ESTree.Node): string | null {
	const node = unwrapExpression(callee);
	if (node.type !== "Identifier" && node.type !== "MemberExpression") {
		return null;
	}

	const direct = importedName(sourceCode, node);
	if (direct !== null) {
		return direct;
	}

	if (node.type !== "MemberExpression" || staticPropertyName(node) !== "required") {
		return null;
	}

	const owner = importedName(sourceCode, unwrapExpression(node.object));
	return owner === null ? null : `${owner}.required`;
}
