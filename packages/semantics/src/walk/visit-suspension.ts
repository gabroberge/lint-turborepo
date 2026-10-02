import { emitUnknown } from "./emit-unknown";
import type { NodeOf } from "./node-handler";
import type { Walker } from "./walker";

/** An `await` or `yield`: other code may run before evaluation resumes. */
export function visitSuspension(walker: Walker, node: NodeOf<"AwaitExpression" | "YieldExpression">): void {
	if (node.argument !== null) {
		walker.visit(node.argument, "run");
	}

	emitUnknown(walker, "suspension", node);
}
