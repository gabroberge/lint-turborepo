import type { ESTree } from "@oxlint/plugins";

import { bindingKind } from "./binding-kind";
import type { Walker } from "./walker";

/** True when an expression denotes the analyzed object: `this`, or the class's own name in static code. */
export function isSelf(walker: Walker, node: ESTree.Node): boolean {
	if (node.type === "ThisExpression") {
		return true;
	}

	const { classId, timeline } = walker.scope;
	return (
		timeline === "static" &&
		node.type === "Identifier" &&
		classId !== null &&
		node.name === classId.name &&
		bindingKind(walker.scope, node) !== "local"
	);
}
