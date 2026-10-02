import type { ClassAssumptions } from "../assumptions/class-assumptions";
import type { AnalyzedMember } from "../member/analyzed-member";
import { isSignature } from "../member/is-signature";
import { parameterPropertyName } from "../member/parameter-property-name";
import type { Timeline } from "../member/timeline";
import type { MemberKind } from "./member-kind";
import { memberKindOf } from "./member-kind-of";

/** Keys of the class's own members that live in a timeline, with how each behaves when touched. */
export function timelineTable(
	assumptions: ClassAssumptions,
	members: readonly AnalyzedMember[],
	timeline: Timeline
): Map<string, MemberKind> {
	const kinds = new Map<string, MemberKind>();
	const isStatic = timeline === "static";

	for (const { key, node } of members) {
		if (node.type === "MethodDefinition" && node.kind === "constructor" && !isStatic) {
			for (const parameter of node.value.params) {
				const name = parameterPropertyName(parameter);
				if (name !== null) {
					kinds.set(name, "parameter");
				}
			}

			continue;
		}

		if (
			key === null ||
			node.type === "StaticBlock" ||
			node.type === "TSIndexSignature" ||
			node.static !== isStatic
		) {
			continue;
		}

		// A body-less signature runs code defined elsewhere, so touching it stays unresolved.
		if (isSignature(node)) {
			continue;
		}

		kinds.set(key, memberKindOf(assumptions, node));
	}

	return kinds;
}
