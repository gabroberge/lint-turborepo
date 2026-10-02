import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True for a plain name such as `factory` or `lib.tools.factory`: an
 * identifier, optionally followed by non-computed property names.
 * Evaluating one reaches no member of a module class.
 */
export function isNamedReference(node: ESTree.Node): boolean {
	const expression = unwrapExpression(node);
	if (expression.type === "Identifier") {
		return true;
	}

	return expression.type === "MemberExpression" && !expression.computed && isNamedReference(expression.object);
}
