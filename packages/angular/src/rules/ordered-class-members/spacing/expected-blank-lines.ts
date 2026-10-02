import type { ClassMember } from "../member/class-member";
import type { ResolvedOptions } from "../options/resolved-options";
import { blankLinePolicy } from "./blank-line-policy";

/**
 * Whether a blank line goes before each member of `order`. Under the
 * `ignore` policy a member keeps whether it had one in the source.
 */
export function expectedBlankLines(
	options: ResolvedOptions,
	order: readonly ClassMember[],
	blankLinesBefore: (member: ClassMember) => number
): boolean[] {
	return order.map((member, position) => {
		const previous = order[position - 1];
		if (previous === undefined) {
			return false;
		}

		const policy = blankLinePolicy(options, previous, member);
		return policy === "ignore" ? blankLinesBefore(member) > 0 : policy === "always";
	});
}
