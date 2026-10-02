import type { ClassMember } from "../member/class-member";
import type { Newlines } from "../options/options";
import type { ResolvedOptions } from "../options/resolved-options";

/**
 * The blank-line policy between two adjacent members: the group's own
 * policy inside a group, `newlinesBetween` across groups. An overload
 * signature always stays attached to the next signature or implementation.
 */
export function blankLinePolicy(options: ResolvedOptions, previous: ClassMember, next: ClassMember): Newlines {
	if (previous.overload && previous.key !== null && previous.key === next.key && previous.static === next.static) {
		return "never";
	}

	const previousGroup = options.groupOf(previous.category);
	if (previousGroup === options.groupOf(next.category)) {
		return previousGroup.newlinesWithin;
	}

	return options.newlinesBetween;
}
