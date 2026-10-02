import type { ClassMember } from "../member/class-member";

/** The member diagnostics name `label`. */
export function memberLabelled(members: readonly ClassMember[], label: string): ClassMember {
	const found = members.find((candidate) => candidate.label === label);
	if (found === undefined) {
		throw new Error(`No member labelled ${label}`);
	}

	return found;
}
