import type { IdentifierNode } from "@gabroberge/oxlint-estree";
import { exportedName, resolveVariable } from "@gabroberge/oxlint-estree";
import type { SourceCode } from "@oxlint/plugins";

const ANGULAR_CORE = "@angular/core";

/**
 * What an identifier imports from `@angular/core`: the exported name for a
 * named import (so `signal as ngSignal` still reads `signal`), `"*"` for a
 * namespace import, or `null` when it is not an `@angular/core` import.
 */
export function angularImportOf(sourceCode: SourceCode, identifier: IdentifierNode): string | null {
	const definition = resolveVariable(sourceCode, identifier)?.defs[0];
	if (definition?.type !== "ImportBinding") {
		return null;
	}

	const declaration = definition.parent;
	if (declaration?.type !== "ImportDeclaration" || declaration.source.value !== ANGULAR_CORE) {
		return null;
	}

	if (declaration.importKind === "type") {
		return null;
	}

	const specifier = definition.node;
	if (specifier.type === "ImportNamespaceSpecifier") {
		return "*";
	}

	if (specifier.type !== "ImportSpecifier" || specifier.importKind === "type") {
		return null;
	}

	return exportedName(specifier.imported);
}
