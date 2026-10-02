import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isSelf } from "./is-self";
import type { Walker } from "./walker";

/**
 * True for a plain name such as `factory` or `lib.tools.factory`: an
 * identifier, optionally followed by non-computed property names, that does
 * not start from the analyzed object. Evaluating one reaches no member.
 */
export function isNamedReference(walker: Walker, node: ESTree.Node): boolean {
	const expression = unwrapExpression(node);
	if (expression.type === "Identifier") {
		return !isSelf(walker, expression);
	}

	return (
		expression.type === "MemberExpression" && !expression.computed && isNamedReference(walker, expression.object)
	);
}
