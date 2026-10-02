import { exportedName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "./binding-from-exported-name";
import { bindingFromExportedName } from "./binding-from-exported-name";

export function collectSpecifier(specifier: ESTree.ImportDeclarationSpecifier, bindings: Map<string, Binding>): void {
	if (specifier.type === "ImportSpecifier") {
		if (specifier.importKind === "type") {
			return;
		}

		const binding = bindingFromExportedName(exportedName(specifier.imported));
		if (binding !== null) {
			bindings.set(specifier.local.name, binding);
		}

		return;
	}

	if (specifier.type === "ImportNamespaceSpecifier") {
		bindings.set(specifier.local.name, { type: "namespace" });
	}
}
