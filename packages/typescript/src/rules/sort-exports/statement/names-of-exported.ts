import type { ESTree } from "@oxlint/plugins";

import { nameOf } from "./name-of";

export function namesOfExported(exported: ESTree.ModuleExportName | null): string[] {
	if (exported === null) {
		return [];
	}

	return [nameOf(exported)];
}
