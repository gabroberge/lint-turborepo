import { staticString } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { MemberKey } from "../model/member-key";

/** The member key a member access names, or `null` when it is computed at runtime. */
export function accessKey(node: ESTree.MemberExpression): MemberKey | null {
	if (node.property.type === "PrivateIdentifier") {
		return { name: node.property.name, private: true };
	}

	if (!node.computed) {
		return { name: node.property.name, private: false };
	}

	if (node.property.type === "Literal" && typeof node.property.value === "number") {
		return { name: String(node.property.value), private: false };
	}

	const name = staticString(node.property);
	return name === null ? null : { name, private: false };
}
