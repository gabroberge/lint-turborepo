import type { ESTree } from "@oxlint/plugins";

import type { MemberEntity } from "../model/declaration";

/** The kind of declaration a class element is. */
export function memberKindOf(node: ESTree.ClassElement): MemberEntity["kind"] {
	if (node.type === "StaticBlock") {
		return "static-block";
	}

	if (node.type === "TSIndexSignature") {
		return "index-signature";
	}

	if (node.type === "AccessorProperty" || node.type === "TSAbstractAccessorProperty") {
		return "accessor-field";
	}

	if (node.type !== "MethodDefinition" && node.type !== "TSAbstractMethodDefinition") {
		return "field";
	}

	if (node.kind === "constructor") {
		return "constructor";
	}

	return node.kind === "get" ? "getter" : node.kind === "set" ? "setter" : "method";
}
