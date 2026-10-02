import type { SourceCode } from "@oxlint/plugins";

import type { AnalyzedMember } from "../index";

/** A readable name for a member: its key, `static block`, `index signature`, or `[source]` for a computed key. */
export function memberLabel(sourceCode: SourceCode, { key, node }: AnalyzedMember): string {
	if (key !== null) {
		return key;
	}

	if (node.type === "StaticBlock") {
		return "static block";
	}

	if (node.type === "TSIndexSignature") {
		return "index signature";
	}

	return `[${sourceCode.getText(node.key)}]`;
}
