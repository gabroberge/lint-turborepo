import type { ESTree } from "@oxlint/plugins";

export function isInstanceMethod(node: ESTree.MethodDefinition): boolean {
	return !node.static && node.kind === "method";
}
