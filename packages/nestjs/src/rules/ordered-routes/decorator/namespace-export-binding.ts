import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../binding/binding-from-exported-name";
import { bindingFromExportedName } from "../binding/binding-from-exported-name";

export function namespaceExportBinding(
	expression: ESTree.MemberExpression,
	bindings: ReadonlyMap<string, Binding>
): Binding | null {
	if (expression.computed || expression.object.type !== "Identifier" || expression.property.type !== "Identifier") {
		return null;
	}

	const namespace = bindings.get(expression.object.name);
	if (namespace?.type !== "namespace") {
		return null;
	}

	return bindingFromExportedName(expression.property.name);
}
