import type { ESTree } from "@oxlint/plugins";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import { fieldKind } from "./field-kind";
import type { MemberKind } from "./member-kind";

/** How a class element with a body or value behaves when analyzed code touches its key. */
export function memberKindOf(assumptions: ClassAssumptions, node: ESTree.ClassElement): MemberKind {
	if (node.type === "PropertyDefinition" || node.type === "AccessorProperty") {
		return fieldKind(assumptions, node.value);
	}

	if (node.type !== "MethodDefinition" && node.type !== "TSAbstractMethodDefinition") {
		return "field";
	}

	return node.kind === "method" ? "method" : "accessor";
}
