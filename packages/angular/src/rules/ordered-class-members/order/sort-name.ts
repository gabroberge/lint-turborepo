import type { ClassMember } from "../member/class-member";

/** The name a member is sorted by: its key without the `#` of a private name, else its label. */
export function sortName(member: ClassMember): string {
	return (member.key ?? member.label).replace(/^#/u, "");
}
