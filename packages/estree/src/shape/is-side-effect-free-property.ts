import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";
import { isSideEffectFree } from "./is-side-effect-free";

export function isSideEffectFreeProperty(member: ESTree.MemberExpression): boolean {
	if (!member.computed) {
		return true;
	}

	return isSideEffectFree(unwrapExpression(member.property));
}
