import type { ESTree } from "@oxlint/plugins";

/** The node a diagnostic points at: the member's key when it has one. */
export function reportTarget(node: ESTree.ClassElement): ESTree.Node {
	if (node.type === "StaticBlock" || node.type === "TSIndexSignature") {
		return node;
	}

	return node.key;
}
