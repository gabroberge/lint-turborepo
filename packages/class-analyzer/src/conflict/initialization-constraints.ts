import type { ESTree, SourceCode } from "@oxlint/plugins";

import type { ClassAssumptions } from "../assumptions/class-assumptions";
import { initializationEffects } from "../effects/initialization-effects";
import type { AnalyzedMember } from "../member/analyzed-member";
import type { Conflict } from "./conflict";
import { conflictTable } from "./conflict-table";

/**
 * How the members of one class body constrain each other's order: for two
 * members in source order, whether the analysis finds that swapping them
 * could change what their initializers observe or do. Members must come from `analyzeMembers(body)`
 * (or extend those records).
 */
export function initializationConstraints(
	sourceCode: SourceCode,
	body: ESTree.ClassBody,
	members: readonly AnalyzedMember[],
	assumptions: ClassAssumptions
): (earlier: AnalyzedMember, later: AnalyzedMember) => Conflict {
	return conflictTable(members, initializationEffects(sourceCode, body, members, assumptions));
}
