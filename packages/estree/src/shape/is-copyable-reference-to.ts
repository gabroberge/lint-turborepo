import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";
import { areIdenticalSafeExpressions } from "./are-identical-safe-expressions";
import { isCopyableReference } from "./is-copyable-reference";

export function isCopyableReferenceTo(expression: ESTree.Expression, target: ESTree.Expression): boolean {
	const core = unwrapExpression(expression);
	if (!isCopyableReference(core)) {
		return false;
	}

	return areIdenticalSafeExpressions(target, core);
}
