import type { ESTree } from "@oxlint/plugins";

export function isNode(value: unknown): value is ESTree.Node {
	return typeof value === "object" && value !== null && "type" in value && typeof value.type === "string";
}
