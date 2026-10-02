import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { angularImportOf } from "./angular-import-of";
import { staticPropertyName } from "./static-property-name";

/**
 * The `@angular/core` export a node names: an identifier bound by a named
 * import, or a member of a namespace import such as `ng.signal`.
 */
export function importedName(sourceCode: SourceCode, node: ESTree.Node): string | null {
	if (node.type === "Identifier") {
		const imported = angularImportOf(sourceCode, node);
		return imported === "*" ? null : imported;
	}

	if (node.type !== "MemberExpression") {
		return null;
	}

	const object = unwrapExpression(node.object);
	if (object.type !== "Identifier" || angularImportOf(sourceCode, object) !== "*") {
		return null;
	}

	return staticPropertyName(node);
}
