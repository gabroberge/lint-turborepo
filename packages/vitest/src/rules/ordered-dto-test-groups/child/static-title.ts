import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * The static string title of a call, from a string literal or an
 * uninterpolated template. Other first arguments are not a title.
 */
export function staticTitle(call: ESTree.CallExpression): string | null {
	const first = call.arguments[0];
	if (first === undefined || first.type === "SpreadElement") {
		return null;
	}

	const value = unwrapExpression(first);
	if (value.type === "Literal" && typeof value.value === "string") {
		return value.value;
	}

	if (value.type === "TemplateLiteral" && value.expressions.length === 0) {
		const cooked = value.quasis[0]?.value.cooked;
		return cooked ?? null;
	}

	return null;
}
