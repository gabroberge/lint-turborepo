import type { ESTree } from "@oxlint/plugins";

export function exportedName(imported: ESTree.ModuleExportName): string | null {
	if (imported.type === "Identifier") {
		return imported.name;
	}

	if (typeof imported.value === "string") {
		return imported.value;
	}

	return null;
}
