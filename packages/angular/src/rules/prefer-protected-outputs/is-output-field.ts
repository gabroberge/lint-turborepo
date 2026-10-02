import type { ESTree } from "@oxlint/plugins";

import { fieldTypeName, initializerCalleeName } from "../../field";

/**
 * True when the field is an Angular output that is not already `protected`:
 * an `output()` initializer or an `OutputEmitterRef` annotation.
 */
export function isOutputField(node: ESTree.PropertyDefinition): boolean {
	if (node.accessibility === "protected") {
		return false;
	}

	if (fieldTypeName(node) === "OutputEmitterRef") {
		return true;
	}

	return initializerCalleeName(node.value) === "output";
}
