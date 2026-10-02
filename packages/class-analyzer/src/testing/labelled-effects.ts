import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { AnalyzedMember, ClassAssumptions } from "../index";
import { NO_ASSUMPTIONS } from "../index";
import { parseWithScope } from "./parse-with-scope";

/** A per-member effect analysis, such as the package's internal `initializationEffects`. */
export type EffectsAnalysis<Effects> = (
	sourceCode: SourceCode,
	body: ESTree.ClassBody,
	members: readonly AnalyzedMember[],
	assumptions: ClassAssumptions
) => readonly (Effects | null)[];

/**
 * Runs `analysis` on the first class of `code` and returns a lookup of each
 * member's effects by label (see `parseWithScope`). The analysis is passed
 * in because it is internal to the package, which testing modules may only
 * reach through its public entry.
 */
export function labelledEffects<Effects>(
	code: string,
	analysis: EffectsAnalysis<Effects>,
	assumptions: ClassAssumptions = NO_ASSUMPTIONS
): (label: string) => Effects | null {
	const { body, labels, members, sourceCode } = parseWithScope(code);
	const effects = analysis(sourceCode, body, members, assumptions);

	return (label) => {
		const member = members.find((candidate) => labels[candidate.index] === label);
		if (member === undefined) {
			throw new Error(`No member labelled ${label}`);
		}

		return effects[member.index] ?? null;
	};
}
