import type { NodeOf } from "./node-handler";
import { visitTarget } from "./visit-target";
import type { Walker } from "./walker";

/** A `for…in` or `for…of` loop. Iterating reads state outside the instance. */
export function visitIteration(walker: Walker, node: NodeOf<"ForInStatement" | "ForOfStatement">): void {
	if (node.left.type === "VariableDeclaration") {
		walker.visit(node.left, false);
	} else {
		visitTarget(walker, node.left, false);
	}

	walker.visit(node.right, false);
	walker.visit(node.body, false);
	walker.effects.external = true;
}
