import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { annotationName } from "../type/annotation-name";
import { isInstantiation } from "./is-instantiation";

export interface InstantiationAnnotation {
	annotation: string;
	call: ESTree.CallExpression;
}

/** A variable whose type annotation names the class of a `transform` / `plainTo*` initializer. */
export function annotationOfInstantiation(node: ESTree.Node): InstantiationAnnotation | null {
	if (node.type !== "VariableDeclarator" || node.id.type !== "Identifier" || node.init === null) {
		return null;
	}

	const annotation = annotationName(node.id);
	if (annotation === null) {
		return null;
	}

	const init = unwrapAwaitedExpression(node.init);
	if (init.type !== "CallExpression" || !isInstantiation(init)) {
		return null;
	}

	return { annotation, call: init };
}
