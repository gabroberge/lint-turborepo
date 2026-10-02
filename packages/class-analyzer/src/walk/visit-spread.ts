import type { NodeOf } from "./node-handler";
import type { Walker } from "./walker";

/** A spread element. Iterating or copying the spread value reads state outside the instance. */
export function visitSpread(walker: Walker, node: NodeOf<"SpreadElement">): void {
	walker.visit(node.argument, false);
	walker.effects.external = true;
}
