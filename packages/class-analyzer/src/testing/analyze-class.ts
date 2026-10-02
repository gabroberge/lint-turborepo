import type { AnalyzedMember, ClassAssumptions, Conflict } from "../index";
import { initializationConstraints, NO_ASSUMPTIONS } from "../index";
import { parseWithScope } from "./parse-with-scope";

export interface AnalyzedClass {
	/** The conflict between two members named by label, in source order. */
	conflict: (first: string, second: string) => Conflict;
}

/**
 * Parses the first class of `code` and computes its initialization
 * constraints. Members are named by key, `static block`, or `[source]` for a
 * computed key (see `parseWithScope`).
 */
export function analyzeClass(code: string, assumptions: ClassAssumptions = NO_ASSUMPTIONS): AnalyzedClass {
	const { body, labels, members, sourceCode } = parseWithScope(code);
	const conflictAt = initializationConstraints(sourceCode, body, members, assumptions);

	function member(label: string): AnalyzedMember {
		const found = members.find((candidate) => labels[candidate.index] === label);
		if (found === undefined) {
			throw new Error(`No member labelled ${label}`);
		}

		return found;
	}

	return {
		conflict(first, second) {
			const left = member(first);
			const right = member(second);
			return left.index < right.index ? conflictAt(left, right) : conflictAt(right, left);
		}
	};
}
