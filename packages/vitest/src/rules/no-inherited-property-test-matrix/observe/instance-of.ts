import { identifierName, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function instanceOfClass(call: ESTree.CallExpression): string | null {
	const callee = unwrapAwaitedExpression(call.callee);
	if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") {
		return null;
	}

	if (callee.property.name !== "toBeInstanceOf") {
		return null;
	}

	const argument = call.arguments[0];
	if (argument === undefined || argument.type === "SpreadElement") {
		return null;
	}

	return identifierName(unwrapAwaitedExpression(argument));
}
