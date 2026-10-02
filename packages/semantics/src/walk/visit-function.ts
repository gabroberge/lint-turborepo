import type { FunctionNode } from "@gabroberge/oxlint-estree";

import { visitBinding } from "./visit-binding";
import type { Walker } from "./walker";

/** A function analyzed as if it ran to completion right away: its parameter defaults, then its body. */
export function visitFunction(walker: Walker, node: FunctionNode): void {
	for (const parameter of node.params) {
		visitBinding(walker, parameter);
	}

	if (node.body !== null) {
		walker.visit(node.body, false);
	}
}
