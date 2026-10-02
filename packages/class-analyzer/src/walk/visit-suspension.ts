import type { NodeOf } from "./node-handler";
import type { Walker } from "./walker";

/** An `await` or `yield`: other code may run before evaluation resumes, which counts as a side effect. */
export function visitSuspension(walker: Walker, node: NodeOf<"AwaitExpression" | "YieldExpression">): void {
	if (node.argument !== null) {
		walker.visit(node.argument, false);
	}

	walker.effects.sideEffects = true;
}
