import type { ESTree } from "@oxlint/plugins";

import type { Visibility } from "../model/visibility";

/** The member's accessibility. No keyword means `public`; a `#private` name means `private`. */
export function memberVisibility(node: ESTree.ClassElement): Visibility {
	if (node.type === "StaticBlock" || node.type === "TSIndexSignature") {
		return "public";
	}

	if (node.key.type === "PrivateIdentifier") {
		return "private";
	}

	return node.accessibility ?? "public";
}
