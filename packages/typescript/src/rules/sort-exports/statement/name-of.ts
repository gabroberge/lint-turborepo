import type { ESTree } from "@oxlint/plugins";

export function nameOf(name: ESTree.ModuleExportName): string {
	if (name.type === "Literal") {
		return name.value;
	}

	return name.name;
}
