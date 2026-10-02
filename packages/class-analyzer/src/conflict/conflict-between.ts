import type { Effects } from "../effects/effects";
import type { AnalyzedMember } from "../member/analyzed-member";
import type { Conflict } from "./conflict";

/** Whether swapping two initializers of the same timeline could change what either one observes or does. */
export function conflictBetween(
	left: AnalyzedMember,
	leftEffects: Effects,
	right: AnalyzedMember,
	rightEffects: Effects
): Conflict {
	const definite =
		touches(leftEffects, right.key) ||
		touches(rightEffects, left.key) ||
		overlaps(leftEffects.writes, rightEffects.reads) ||
		overlaps(leftEffects.writes, rightEffects.writes) ||
		overlaps(rightEffects.writes, leftEffects.reads);
	if (definite) {
		return "definite";
	}

	const uncertain =
		leftEffects.opaque ||
		rightEffects.opaque ||
		(leftEffects.sideEffects && (rightEffects.sideEffects || rightEffects.external)) ||
		(rightEffects.sideEffects && leftEffects.external);
	return uncertain ? "uncertain" : "none";
}

function overlaps(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
	for (const key of left) {
		if (right.has(key)) {
			return true;
		}
	}

	return false;
}

function touches(effects: Effects, key: string | null): boolean {
	return key !== null && (effects.reads.has(key) || effects.writes.has(key));
}
