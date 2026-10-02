import type { ESTree } from "@oxlint/plugins";

import { keyLabel } from "../member/key-label";
import type { MemberKey } from "../model/member-key";

/** How a member is named in qualified names: its key, `constructor`, `static block` or `[computed]`. */
export function memberLabel(node: ESTree.ClassElement, key: MemberKey | null): string {
	if (node.type === "StaticBlock") {
		return "static block";
	}

	if (node.type === "TSIndexSignature") {
		return "[index]";
	}

	if (node.type === "MethodDefinition" && node.kind === "constructor") {
		return "constructor";
	}

	return key === null ? "[computed]" : keyLabel(key);
}
