import { staticString } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** The property key a member access names, or `null` when it is computed at runtime. */
export function accessKey(node: ESTree.MemberExpression): string | null {
	if (node.property.type === "PrivateIdentifier") {
		return `#${node.property.name}`;
	}

	if (!node.computed) {
		return node.property.name;
	}

	if (node.property.type === "Literal" && typeof node.property.value === "number") {
		return String(node.property.value);
	}

	return staticString(node.property);
}
