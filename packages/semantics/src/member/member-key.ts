import type { ESTree } from "@oxlint/plugins";

import type { MemberKey } from "../model/member-key";

/**
 * The runtime key of a class element: an identifier, a `#private` name, or
 * a computed string or number literal. Any other computed key is `null`.
 */
export function memberKey(node: ESTree.ClassElement): MemberKey | null {
	if (node.type === "StaticBlock" || node.type === "TSIndexSignature") {
		return null;
	}

	const { key } = node;
	if (key.type === "PrivateIdentifier") {
		return { name: key.name, private: true };
	}

	if (!node.computed && key.type === "Identifier") {
		return { name: key.name, private: false };
	}

	if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number")) {
		return { name: String(key.value), private: false };
	}

	return null;
}
