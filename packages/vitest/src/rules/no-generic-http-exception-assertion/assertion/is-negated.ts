import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function isNegated(expression: ESTree.Expression): boolean {
	const unwrapped = unwrapExpression(expression);
	return (
		unwrapped.type === "MemberExpression" &&
		!unwrapped.computed &&
		unwrapped.property.type === "Identifier" &&
		unwrapped.property.name === "not"
	);
}
