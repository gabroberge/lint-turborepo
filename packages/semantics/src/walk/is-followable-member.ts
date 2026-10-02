import type { ModelDraft } from "../build/model-draft";
import type { MemberTarget } from "../model/target";

/**
 * True when calling a member of a module class runs code the model
 * analyzes: a method with a body, or a field or accessor field initialized
 * with a function literal or a signal-like callable, never assigned outside
 * its declaration. Calling anything else (an undeclared or inherited key, a
 * getter's result, a signature, a parameter property, a field holding some
 * other value) runs code the model cannot see.
 */
export function isFollowableMember(draft: ModelDraft, target: MemberTarget): boolean {
	const member = target.member === null ? undefined : draft.declarations.get(target.member);
	if (member?.kind !== "method" && member?.kind !== "field" && member?.kind !== "accessor-field") {
		return false;
	}

	if (member.signature || member.reassigned) {
		return false;
	}

	return member.kind === "method" || member.value === "function" || member.value === "assumed-callable";
}
