import type { AnalyzedMember, ClassAssumptions, Conflict } from "../index";
import { analyzeMembers, initializationConstraints } from "../index";
import { parseWithScope } from "./parse-with-scope";

export interface ClassConstraints {
	conflictAt: (earlier: AnalyzedMember, later: AnalyzedMember) => Conflict;
	members: AnalyzedMember[];
}

/** The members of the first class of `code`, with the constraints between them, through the public API only. */
export function classConstraints(code: string, assumptions: ClassAssumptions): ClassConstraints {
	const { body, sourceCode } = parseWithScope(code);
	const members = analyzeMembers(body);
	return { conflictAt: initializationConstraints(sourceCode, body, members, assumptions), members };
}
