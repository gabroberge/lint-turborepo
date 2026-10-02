import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "./binding-from-exported-name";
import { collectSpecifier } from "./collect-specifier";

const NEST_COMMON = "@nestjs/common";

export function collectImport(node: ESTree.ImportDeclaration, bindings: Map<string, Binding>): void {
	if (node.source.value !== NEST_COMMON || node.importKind === "type") {
		return;
	}

	for (const specifier of node.specifiers) {
		collectSpecifier(specifier, bindings);
	}
}
