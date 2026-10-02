import { exportedName } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export type Binding = { type: "exception" } | { type: "namespace"; exceptionNames: ReadonlySet<string> };

const NEST_COMMON = "@nestjs/common";

export function collectImport(
	node: ESTree.ImportDeclaration,
	bindings: Map<string, Binding>,
	exceptionNames: ReadonlySet<string>
): void {
	if (node.source.value !== NEST_COMMON || node.importKind === "type") {
		return;
	}

	for (const specifier of node.specifiers) {
		if (specifier.type === "ImportSpecifier") {
			if (specifier.importKind === "type") {
				continue;
			}

			const exported = exportedName(specifier.imported);
			if (exported === null || !exceptionNames.has(exported)) {
				continue;
			}

			bindings.set(specifier.local.name, { type: "exception" });
			continue;
		}

		if (specifier.type === "ImportNamespaceSpecifier") {
			bindings.set(specifier.local.name, { exceptionNames, type: "namespace" });
		}
	}
}
