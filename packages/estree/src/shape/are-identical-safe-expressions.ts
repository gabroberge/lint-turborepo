import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";
import { isSideEffectFree } from "./is-side-effect-free";
import { sameSafeShape } from "./same-safe-shape";

export function areIdenticalSafeExpressions(left: ESTree.Expression, right: ESTree.Expression): boolean {
	const a = unwrapExpression(left);
	if (!isSideEffectFree(a)) {
		return false;
	}

	const b = unwrapExpression(right);
	if (!isSideEffectFree(b)) {
		return false;
	}

	return sameSafeShape(a, b);
}
