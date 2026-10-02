import type { ESTree } from "@oxlint/plugins";

import { fieldTypeName, initializerCalleeName } from "../../field";

const resourceCallees = new Set(["resource", "rxResource"]);

/**
 * True when the field is a mutable Angular resource: a `resource` /
 * `rxResource` initializer or a `ResourceRef` annotation, without `readonly`.
 */
export function isResourceField(node: ESTree.PropertyDefinition): boolean {
	if (node.readonly === true) {
		return false;
	}

	if (fieldTypeName(node) === "ResourceRef") {
		return true;
	}

	const callee = initializerCalleeName(node.value);
	return callee !== null && resourceCallees.has(callee);
}
