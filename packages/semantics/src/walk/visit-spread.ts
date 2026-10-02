import type { NodeOf } from "./node-handler";
import type { Walker } from "./walker";

/** A spread element: the spread value is evaluated. Iterating it is assumed to run no other code. */
export function visitSpread(walker: Walker, node: NodeOf<"SpreadElement">): void {
	walker.visit(node.argument, "run");
}
