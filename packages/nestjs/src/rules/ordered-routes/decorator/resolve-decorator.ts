import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../binding/binding-from-exported-name";
import { namespaceExportBinding } from "./namespace-export-binding";

export function resolveDecorator(
	expression: ESTree.Expression,
	bindings: ReadonlyMap<string, Binding>
): Binding | null {
	const unwrapped = unwrapExpression(expression);

	if (unwrapped.type === "Identifier") {
		return bindings.get(unwrapped.name) ?? null;
	}

	if (unwrapped.type === "MemberExpression") {
		return namespaceExportBinding(unwrapped, bindings);
	}

	return null;
}
