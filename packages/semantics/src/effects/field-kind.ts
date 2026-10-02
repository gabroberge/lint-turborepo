import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import type { MemberKind } from "./member-kind";

/**
 * Whether calling the field's value runs only code the analysis can see: a
 * stored function literal, or the result of a call assumed to be a
 * `signal-factory`. Any other value may be a function from anywhere.
 */
export function fieldKind(assumptions: ClassAssumptions, value: ESTree.Expression | null): MemberKind {
	if (value === null) {
		return "field";
	}

	const expression = unwrapExpression(value);
	if (isFunctionNode(expression)) {
		return "function-field";
	}

	if (expression.type !== "CallExpression") {
		return "field";
	}

	return assumptions.assumeCall(expression) === "signal-factory" ? "function-field" : "field";
}
