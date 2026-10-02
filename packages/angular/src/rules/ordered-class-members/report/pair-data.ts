import type { ClassMember } from "../member/class-member";

/** Message data naming a member and the one it should precede. */
export function pairData(member: ClassMember, other: ClassMember): Record<string, string> {
	return { category: member.category, name: member.label, other: other.label, otherCategory: other.category };
}
