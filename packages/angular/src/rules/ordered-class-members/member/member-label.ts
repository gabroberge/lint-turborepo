import type { ESTree, SourceCode } from "@oxlint/plugins";

/** How a member is named in a diagnostic. */
export function memberLabel(sourceCode: SourceCode, node: ESTree.ClassElement, key: string | null): string {
	if (node.type === "StaticBlock") {
		return "static block";
	}

	if (node.type === "TSIndexSignature") {
		return "index signature";
	}

	return key ?? `[${sourceCode.getText(node.key)}]`;
}
