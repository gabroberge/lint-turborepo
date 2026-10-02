import type { ESTree } from "@oxlint/plugins";

/** True for a method declared without a body: an abstract method or an overload signature. */
export function isSignature(node: ESTree.ClassElement): boolean {
	if (node.type === "TSAbstractMethodDefinition") {
		return true;
	}

	return node.type === "MethodDefinition" && node.value.body === null;
}
