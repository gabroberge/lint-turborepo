import type { ClassMember } from "../member/class-member";
import type { ResolvedOptions } from "../options/resolved-options";

/** A member's position in its group's visibility order; a visibility the group leaves out ranks last. */
export function visibilityRank(options: ResolvedOptions, member: ClassMember): number {
	const { visibility } = options.groupOf(member.category);
	const rank = visibility.indexOf(member.visibility);
	return rank === -1 ? visibility.length : rank;
}
