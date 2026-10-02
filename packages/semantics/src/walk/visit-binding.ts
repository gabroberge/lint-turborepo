import type { ESTree } from "@oxlint/plugins";

import type { Walker } from "./walker";

/** A declared binding pattern: only its default values and computed keys run. */
export function visitBinding(walker: Walker, node: ESTree.Node): void {
	if (node.type === "AssignmentPattern") {
		visitBinding(walker, node.left);
		walker.visit(node.right, "run");
	} else if (node.type === "ArrayPattern") {
		for (const element of node.elements) {
			if (element !== null) {
				visitBinding(walker, element);
			}
		}
	} else if (node.type === "ObjectPattern") {
		for (const property of node.properties) {
			if (property.type === "RestElement") {
				visitBinding(walker, property.argument);
				continue;
			}

			if (property.computed) {
				walker.visit(property.key, "run");
			}

			visitBinding(walker, property.value);
		}
	} else if (node.type === "RestElement") {
		visitBinding(walker, node.argument);
	} else if (node.type === "TSParameterProperty") {
		visitBinding(walker, node.parameter);
	}
}
