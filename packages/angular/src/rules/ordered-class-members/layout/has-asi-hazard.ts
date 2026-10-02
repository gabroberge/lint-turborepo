import type { ESTree } from "@oxlint/plugins";

import { isFieldLike } from "./is-field-like";

const HAZARD_STARTS = new Set(["(", "*", "+", "-", ".", "/", "<", "[", "`"]);

/** A field named like a modifier, which would turn into one for whatever member follows it. */
const MODIFIER_NAME =
	/(?:^|\s)(?:abstract|accessor|async|declare|get|override|private|protected|public|readonly|set|static)$/u;

/**
 * Whether placing the members in `order` would put a member without a terminating `;` right before a member that
 * automatic semicolon insertion would join to it: one starting with an operator-like character, or any member after a
 * field named like a modifier (`get`, `static`, ...).
 */
export function hasAsiHazard(
	source: string,
	members: readonly ESTree.ClassElement[],
	order: readonly number[]
): boolean {
	return order.some((memberIndex, position) => {
		const current = members[memberIndex];
		const nextIndex = order[position + 1];
		const next = nextIndex === undefined ? undefined : members[nextIndex];
		if (current === undefined || next === undefined || !isFieldLike(current)) {
			return false;
		}

		const currentText = source.slice(current.range[0], current.range[1]).trimEnd();
		const nextText = source.slice(next.range[0], next.range[1]).trimStart();

		if (currentText.endsWith(";")) {
			return false;
		}

		return HAZARD_STARTS.has(nextText.charAt(0)) || MODIFIER_NAME.test(currentText);
	});
}
