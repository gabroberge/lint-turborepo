import { emitUnknown } from "./emit-unknown";
import type { NodeOf } from "./node-handler";
import { visitTarget } from "./visit-target";
import type { Walker } from "./walker";

/** A `for…in` or `for…of` loop; `for await` also suspends. */
export function visitIteration(walker: Walker, node: NodeOf<"ForInStatement" | "ForOfStatement">): void {
	if (node.left.type === "VariableDeclaration") {
		walker.visit(node.left, "run");
	} else {
		visitTarget(walker, node.left, false);
	}

	walker.visit(node.right, "run");
	if (node.type === "ForOfStatement" && node.await) {
		emitUnknown(walker, "suspension", node);
	}

	walker.visit(node.body, "run");
}
