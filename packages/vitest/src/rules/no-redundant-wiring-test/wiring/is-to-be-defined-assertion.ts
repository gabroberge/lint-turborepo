import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * `expect(value).toBeDefined()` with no extra arguments, optional chaining,
 * computed access, or spread. The title is not read. Transparent wrappers
 * around the call or the value still match.
 */
export function isToBeDefinedAssertion(expression: ESTree.Expression): boolean {
	const call = unwrapExpression(expression);
	if (call.type !== "CallExpression" || call.arguments.length !== 0 || call.optional) {
		return false;
	}

	const callee = unwrapExpression(call.callee);
	if (
		callee.type !== "MemberExpression" ||
		callee.computed ||
		callee.optional ||
		callee.property.type !== "Identifier" ||
		callee.property.name !== "toBeDefined"
	) {
		return false;
	}

	const expectCall = unwrapExpression(callee.object);
	if (expectCall.type !== "CallExpression" || expectCall.optional || expectCall.arguments.length !== 1) {
		return false;
	}

	if (expectCall.arguments[0]?.type === "SpreadElement") {
		return false;
	}

	const expectCallee = unwrapExpression(expectCall.callee);
	return expectCallee.type === "Identifier" && expectCallee.name === "expect";
}
