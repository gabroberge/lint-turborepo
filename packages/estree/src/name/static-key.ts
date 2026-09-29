import type { ESTree } from "@oxlint/plugins";

export function staticKey(key: ESTree.Node): string | null {
	if (key.type === "Identifier") {
		return key.name;
	}

	if (key.type === "Literal" && typeof key.value === "string") {
		return key.value;
	}

	return null;
}
