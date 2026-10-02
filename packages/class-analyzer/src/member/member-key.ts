import type { ESTree } from "@oxlint/plugins";

/**
 * The runtime key of a class element: an identifier, a `#private` name, or
 * a computed string / number literal. Any other computed key is `null`.
 */
export function memberKey(node: ESTree.ClassElement): string | null {
	if (node.type === "StaticBlock" || node.type === "TSIndexSignature") {
		return null;
	}

	const { key } = node;
	if (key.type === "PrivateIdentifier") {
		return `#${key.name}`;
	}

	if (!node.computed && key.type === "Identifier") {
		return key.name;
	}

	if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number")) {
		return String(key.value);
	}

	return null;
}
